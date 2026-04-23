"""MyAnimeList (MAL) metadata provider.

MAL provides manga metadata via REST API.
REQUIRES: Client ID for API access (obtain from https://myanimelist.net/apiconfig)
Rate limit: 1 req/sec

API Docs: https://myanimelist.net/apiconfig/references/api/v2
"""

import asyncio
from typing import Any

import httpx

from mangarr.metadata.base import ChapterMetadata, MangaMetadata, MetadataProvider
from mangarr.metadata.registry import register_provider


@register_provider("myanimelist")
class MyAnimeListProvider(MetadataProvider):
    """MyAnimeList manga metadata provider."""

    name = "myanimelist"
    base_url = "https://api.myanimelist.net/v2"
    rate_limit_seconds = 1.0
    supports_search = True
    supports_chapters = False  # MAL doesn't track individual chapters

    def __init__(self, client_id: str | None = None, rate_limit: float | None = None) -> None:
        self.client_id = client_id
        self.rate_limit = rate_limit or self.rate_limit_seconds
        self._last_request: float | None = None
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            headers = {
                "Accept": "application/json",
            }
            if self.client_id:
                headers["X-MAL-CLIENT-ID"] = self.client_id

            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=headers,
                timeout=30.0,
            )
        return self._client

    async def _rate_limited_get(self, path: str, **kwargs: Any) -> dict[str, Any]:
        """Make a rate-limited GET request."""
        if self._last_request is not None:
            elapsed = asyncio.get_event_loop().time() - self._last_request
            if elapsed < self.rate_limit:
                await asyncio.sleep(self.rate_limit - elapsed)

        client = await self._get_client()
        response = await client.get(path, **kwargs)
        self._last_request = asyncio.get_event_loop().time()

        response.raise_for_status()
        return response.json()

    def _normalize_manga(self, data: dict[str, Any]) -> MangaMetadata:
        """Convert MAL manga to normalized MangaMetadata."""
        node = data.get("node", data)  # Handle both search and detail formats

        # Extract titles
        title = node.get("title", "Unknown")
        alt_titles = []
        if node.get("alternative_titles"):
            alt = node["alternative_titles"]
            for t in [alt.get("en"), alt.get("ja")]:
                if t and t != title:
                    alt_titles.append(t)
            alt_titles.extend(alt.get("synonyms", []))

        # Authors (MAL provides as list of objects)
        authors = []
        for author in node.get("authors", []):
            if author.get("node"):
                authors.append(author["node"].get("first_name", "") + " " + author["node"].get("last_name", ""))

        # Map status
        status_map = {
            "currently_publishing": "ongoing",
            "finished": "completed",
            "not_yet_published": "upcoming",
        }

        # MAL doesn't provide content ratings directly
        content_rating = "safe"
        genres = [g.get("name", "") for g in node.get("genres", [])]
        nsfw_genres = {"Hentai", "Erotica", "Adult"}
        if any(g in nsfw_genres for g in genres):
            content_rating = "erotica"
        elif "Ecchi" in genres:
            content_rating = "suggestive"

        # Pictures
        pictures = node.get("main_picture", {})
        cover_url = pictures.get("large") or pictures.get("medium")

        return MangaMetadata(
            title=title,
            external_ids={"mal": str(node.get("id"))},
            description=node.get("synopsis"),
            alternative_titles=alt_titles[:10],
            authors=authors,
            artists=[],  # MAL doesn't distinguish author vs artist well
            status=status_map.get(node.get("status"), "unknown"),
            genres=genres,
            tags=[],  # MAL uses genres as tags
            content_rating=content_rating,
            cover_url=cover_url,
            year=node.get("start_date", "")[:4] if node.get("start_date") else None,
            total_chapters=node.get("num_chapters") if node.get("num_chapters") else None,
            source_provider=self.name,
            source_url=f"https://myanimelist.net/manga/{node.get('id')}",
            raw_data=node,
        )

    async def search(self, query: str, limit: int = 10) -> list[MangaMetadata]:
        """Search MyAnimeList for manga."""
        if not self.client_id:
            raise RuntimeError("MyAnimeList requires a client_id. Get one at https://myanimelist.net/apiconfig")

        data = await self._rate_limited_get(
            "/manga",
            params={
                "q": query,
                "limit": limit,
                "fields": "id,title,main_picture,alternative_titles,start_date,synopsis,genres,authors,status,num_chapters",
            },
        )

        results = []
        for item in data.get("data", []):
            results.append(self._normalize_manga(item))

        return results

    async def get_manga(self, provider_id: str) -> MangaMetadata | None:
        """Fetch specific manga by MAL ID."""
        if not self.client_id:
            raise RuntimeError("MyAnimeList requires a client_id")

        try:
            data = await self._rate_limited_get(
                f"/manga/{provider_id}",
                params={
                    "fields": "id,title,main_picture,alternative_titles,start_date,synopsis,genres,authors,status,num_chapters",
                },
            )

            return self._normalize_manga(data)
        except httpx.HTTPError:
            return None

    async def get_chapters(self, provider_id: str, offset: int = 0, limit: int = 100) -> list[ChapterMetadata]:
        """MAL doesn't provide chapter lists."""
        return []

    async def health_check(self) -> bool:
        """Check if MAL API is accessible."""
        if not self.client_id:
            return False

        try:
            await self._rate_limited_get(
                "/manga/1",
                params={"fields": "id"},
            )
            return True
        except Exception:
            return False
