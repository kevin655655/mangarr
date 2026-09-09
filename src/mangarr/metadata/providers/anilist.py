"""AniList metadata provider.

AniList provides comprehensive manga metadata with a GraphQL API.
No authentication required for read operations.
Rate limit: ~90 requests per minute (conservative: 1 req/sec)

API Docs: https://docs.anilist.co/
"""

import asyncio
from typing import Any

import httpx

from mangarr.metadata.base import ChapterMetadata, MangaMetadata, MetadataProvider
from mangarr.metadata.registry import register_provider


@register_provider("anilist")
class AniListProvider(MetadataProvider):
    """AniList manga metadata provider."""

    name = "anilist"
    base_url = "https://graphql.anilist.co"
    rate_limit_seconds = 1.0
    supports_search = True
    supports_chapters = False  # AniList doesn't track individual chapters

    # GraphQL query for manga search
    SEARCH_QUERY = """
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: MANGA) {
          id
          title {
            romaji
            english
            native
          }
          description
          status
          genres
          tags {
            name
          }
          coverImage {
            large
          }
          bannerImage
          startDate {
            year
          }
          staff {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
          siteUrl
        }
      }
    }
    """

    # GraphQL query for single manga
    MANGA_QUERY = """
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        id
        title {
          romaji
          english
          native
        }
        description
        status
        genres
        tags {
          name
        }
        coverImage {
          large
          extraLarge
        }
        bannerImage
        startDate {
          year
        }
        staff {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
        siteUrl
        chapters
        volumes
        isAdult
      }
    }
    """

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
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def _rate_limited_request(self, query: str, variables: dict[str, Any]) -> dict[str, Any]:
        """Make a rate-limited GraphQL request."""
        if self._last_request is not None:
            elapsed = asyncio.get_event_loop().time() - self._last_request
            if elapsed < self.rate_limit:
                await asyncio.sleep(self.rate_limit - elapsed)

        client = await self._get_client()
        response = await client.post(
            "",
            json={"query": query, "variables": variables},
        )
        self._last_request = asyncio.get_event_loop().time()

        response.raise_for_status()
        data = response.json()

        if "errors" in data:
            raise RuntimeError(f"AniList API error: {data['errors']}")

        return data["data"]

    def _normalize_media(self, media: dict[str, Any]) -> MangaMetadata:
        """Convert AniList media to normalized MangaMetadata."""
        title = (
            media["title"]["english"]
            or media["title"]["romaji"]
            or media["title"]["native"]
            or "Unknown"
        )

        alt_titles = []
        for t in [media["title"]["romaji"], media["title"]["native"], media["title"]["english"]]:
            if t and t != title:
                alt_titles.append(t)

        # Extract authors/artists from staff
        authors = []
        artists = []
        for edge in media.get("staff", {}).get("edges", []):
            name = edge["node"]["name"]["full"]
            role = edge["role"].lower() if edge["role"] else ""
            if "story" in role or "original" in role:
                authors.append(name)
            if "art" in role:
                artists.append(name)

        # Map status
        status_map = {
            "RELEASING": "ongoing",
            "FINISHED": "completed",
            "NOT_YET_RELEASED": "upcoming",
            "CANCELLED": "cancelled",
            "HIATUS": "hiatus",
        }

        # Content rating
        content_rating = "safe"
        if media.get("isAdult"):
            content_rating = "erotica"
        elif any(tag in ["Ecchi", "Smut"] for tag in [t["name"] for t in media.get("tags", [])]):
            content_rating = "suggestive"

        return MangaMetadata(
            title=title,
            external_ids={"anilist": str(media["id"])},
            description=media.get("description"),
            alternative_titles=alt_titles,
            authors=authors,
            artists=artists,
            status=status_map.get(media.get("status"), "unknown"),
            genres=media.get("genres", []),
            tags=[t["name"] for t in media.get("tags", [])],
            content_rating=content_rating,
            cover_url=media.get("coverImage", {}).get("large")
            or media.get("coverImage", {}).get("extraLarge"),
            banner_url=media.get("bannerImage"),
            year=media.get("startDate", {}).get("year"),
            total_chapters=media.get("chapters"),
            source_provider=self.name,
            source_url=media.get("siteUrl"),
            raw_data=media,
        )

    async def search(self, query: str, limit: int = 10) -> list[MangaMetadata]:
        """Search AniList for manga."""
        data = await self._rate_limited_request(
            self.SEARCH_QUERY,
            {"search": query, "page": 1, "perPage": limit},
        )

        results = []
        for media in data.get("Page", {}).get("media", []):
            results.append(self._normalize_media(media))

        return results

    async def get_manga(self, provider_id: str) -> MangaMetadata | None:
        """Fetch specific manga by AniList ID."""
        try:
            data = await self._rate_limited_request(
                self.MANGA_QUERY,
                {"id": int(provider_id)},
            )

            media = data.get("Media")
            if not media:
                return None

            return self._normalize_media(media)
        except (ValueError, httpx.HTTPError):
            return None

    async def get_chapters(self, provider_id: str, offset: int = 0, limit: int = 100) -> list[ChapterMetadata]:
        """AniList doesn't provide chapter lists."""
        return []

    async def health_check(self) -> bool:
        """Check if AniList API is accessible."""
        try:
            await self._rate_limited_request(
                "query { SiteStatistics { manga { nodes { count } } } }",
                {},
            )
            return True
        except Exception:
            return False
