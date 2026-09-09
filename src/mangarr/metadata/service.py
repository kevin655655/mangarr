"""Unified metadata service that aggregates across providers."""

import asyncio
from typing import Any

from mangarr.config import settings
from mangarr.metadata.base import MangaMetadata, MetadataProvider
from mangarr.metadata.registry import ProviderRegistry


class MetadataService:
    """High-level service for manga metadata operations."""

    def __init__(self) -> None:
        self._providers: dict[str, MetadataProvider] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize enabled providers based on config."""
        if self._initialized:
            return

        # Import and register built-in providers
        from mangarr.metadata.providers import anilist, mangadex, myanimelist

        # Initialize enabled providers
        if settings.anilist_enabled:
            from mangarr.metadata.providers.anilist import AniListProvider

            self._providers["anilist"] = AniListProvider()

        if settings.mangadex_enabled:
            from mangarr.metadata.providers.mangadex import MangaDexProvider

            self._providers["mangadex"] = MangaDexProvider()

        if settings.myanimelist_enabled and settings.myanimelist_client_id:
            from mangarr.metadata.providers.myanimelist import MyAnimeListProvider

            self._providers["myanimelist"] = MyAnimeListProvider(
                client_id=settings.myanimelist_client_id
            )

        self._initialized = True

    @property
    def providers(self) -> dict[str, MetadataProvider]:
        """Get initialized providers."""
        return self._providers.copy()

    async def search(
        self, query: str, providers: list[str] | None = None, limit: int = 10
    ) -> dict[str, list[MangaMetadata]]:
        """Search across all or specified providers."""
        await self.initialize()

        targets = (
            {name: self._providers[name] for name in providers if name in self._providers}
            if providers
            else self._providers
        )

        results: dict[str, list[MangaMetadata]] = {}

        async def search_provider(name: str, provider: MetadataProvider) -> None:
            try:
                results[name] = await provider.search(query, limit=limit)
            except Exception as e:
                # Log error but don't fail entire search
                results[name] = []
                print(f"Provider {name} search failed: {e}")

        await asyncio.gather(
            *[search_provider(name, p) for name, p in targets.items()],
            return_exceptions=True,
        )

        return results

    async def get_manga(
        self, provider: str, provider_id: str
    ) -> MangaMetadata | None:
        """Get manga metadata from a specific provider."""
        await self.initialize()

        if provider not in self._providers:
            return None

        return await self._providers[provider].get_manga(provider_id)

    async def health_check(self) -> dict[str, bool]:
        """Check health of all providers."""
        await self.initialize()

        results: dict[str, bool] = {}
        for name, provider in self._providers.items():
            try:
                results[name] = await provider.health_check()
            except Exception:
                results[name] = False

        return results
