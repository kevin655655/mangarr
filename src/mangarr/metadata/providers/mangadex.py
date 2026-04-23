"""MangaDex metadata provider.

MangaDex provides manga metadata and chapter information via REST API.
No authentication required for basic read operations.
Rate limit: 5 req/sec per IP (be conservative: 0.5 req/sec)

API Docs: https://api.mangadex.org/docs/
"""

import asyncio
from typing import Any

import httpx

from mangarr.metadata.base import ChapterMetadata, MangaMetadata, MetadataProvider
from mangarr.metadata.registry import register_provider


@register_provider("mangadex")
class MangaDexProvider(MetadataProvider):
    """MangaDex manga metadata provider."""

    name = "mangadex"
    base_url = "https://api.mangadex.org"
    rate_limit_seconds = 0.5
    supports_search = True
    supports_chapters = True

    def __init__(self, rate_limit: float | None = None) -> None:
        self.rate_limit = rate_limit or self.rate_limit_seconds
        self._last_request: float | None = None
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "User-Agent": "Mangarr/0.1.0",
                    "Accept": "application/json",
                },
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
        """Convert MangaDex manga to normalized MangaMetadata."""
        attrs = data["attributes"]
        rels = {r["type"]: r for r in data.get("relationships", [])}

        # Title (prefer English, fallback to romaji/native)
        titles = attrs.get("title", {})
        alt_titles = attrs.get("altTitles", [])

        title = (
            titles.get("en")
            or alt_titles[0].get("en")
            or titles.get("ja-ro")
            or titles.get("ja")
            or "Unknown"
        )

        # Collect alternative titles
        all_alt = []
        for t in [titles.get("ja-ro"), titles.get("ja")] + [
            a.get("en") or a.get("ja-ro") or a.get("ja") for a in alt_titles
        ]:
            if t and t != title and t not in all_alt:
                all_alt.append(t)

        # Authors/artists from relationships
        authors = []
        artists = []
        for rel in data.get("relationships", []):
            if rel["type"] == "author":
                authors.append(rel["attributes"]["name"])
            elif rel["type"] == "artist":
                artists.append(rel["attributes"]["name"])

        # Map status
        status_map = {
            "ongoing": "ongoing",
            "completed": "completed",
            "hiatus": "hiatus",
            "cancelled": "cancelled",
        }

        # Content rating
        content_map = {
            "safe": "safe",
            "suggestive": "suggestive",
            "erotica": "erotica",
            "pornographic": "erotica",
        }

        # Cover art
        cover_url = None
        for rel in data.get("relationships", []):
            if rel["type"] == "cover_art":
                filename = rel["attributes"]["fileName"]
                cover_url = f"https://uploads.mangadex.org/covers/{data['id']}/{filename}"
                break

        return MangaMetadata(
            title=title,
            external_ids={"mangadex": data["id"]},
            description=attrs.get("description", {}).get("en"),
            alternative_titles=all_alt[:10],  # Limit to avoid bloat
            authors=authors,
            artists=artists,
            status=status_map.get(attrs.get("status"), "unknown"),
            genres=[t["attributes"]["name"]["en"] for t in data.get("relationships", [])
                   if t["type"] == "tag"],
            tags=[],  # MangaDex uses genres as tags
            content_rating=content_map.get(attrs.get("contentRating"), "safe"),
            cover_url=cover_url,
            year=attrs.get("year"),
            original_language=attrs.get("originalLanguage"),
            source_provider=self.name,
            source_url=f"https://mangadex.org/title/{data['id']}",
            raw_data=data,
        )

    def _normalize_chapter(self, data: dict[str, Any]) -> ChapterMetadata:
        """Convert MangaDex chapter to normalized ChapterMetadata."""
        attrs = data["attributes"]

        # Parse chapter number
        try:
            chapter_num = float(attrs.get("chapter", 0) or 0)
        except ValueError:
            chapter_num = 0.0

        return ChapterMetadata(
            chapter_number=chapter_num,
            title=attrs.get("title"),
            volume=int(attrs["volume"]) if attrs.get("volume") else None,
            page_count=attrs.get("pages"),
            external_id=data["id"],
            extra={
                "translated_language": attrs.get("translatedLanguage"),
                "uploader": attrs.get("uploader"),
            },
        )

    async def search(self, query: str, limit: int = 10) -> list[MangaMetadata]:
        """Search MangaDex for manga."""
        data = await self._rate_limited_get(
            "/manga",
            params={
                "title": query,
                "limit": limit,
                "includes[]": ["cover_art", "author", "artist"],
            },
        )

        results = []
        for manga in data.get("data", []):
            results.append(self._normalize_manga(manga))

        return results

    async def get_manga(self, provider_id: str) -> MangaMetadata | None:
        """Fetch specific manga by MangaDex ID."""
        try:
            data = await self._rate_limited_get(
                f"/manga/{provider_id}",
                params={"includes[]": ["cover_art", "author", "artist"]},
            )

            manga = data.get("data")
            if not manga:
                return None

            return self._normalize_manga(manga)
        except httpx.HTTPError:
            return None

    async def get_chapters(
        self, provider_id: str, offset: int = 0, limit: int = 100
    ) -> list[ChapterMetadata]:
        """Fetch chapters for a manga."""
        data = await self._rate_limited_get(
            "/chapter",
            params={
                "manga": provider_id,
                "offset": offset,
                "limit": limit,
                "translatedLanguage[]": ["en"],  # Default to English
                "order[chapter]": "asc",
            },
        )

        return [self._normalize_chapter(ch) for ch in data.get("data", [])]

    async def health_check(self) -> bool:
        """Check if MangaDex API is accessible."""
        try:
            await self._rate_limited_get("/ping")
            return True
        except Exception:
            return False
