"""Base classes and types for metadata providers."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class ChapterMetadata:
    """Metadata for a single manga chapter."""

    chapter_number: float
    title: str | None = None
    volume: int | None = None
    release_date: datetime | None = None
    page_count: int | None = None
    external_id: str | None = None  # Provider-specific ID
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass
class MangaMetadata:
    """Normalized manga metadata across all providers."""

    # Identifiers
    title: str
    external_ids: dict[str, str] = field(default_factory=dict)
    # e.g., {"anilist": "12345", "mangadex": "abc-def", "mal": "67890"}

    # Basic info
    description: str | None = None
    alternative_titles: list[str] = field(default_factory=list)
    authors: list[str] = field(default_factory=list)
    artists: list[str] = field(default_factory=list)

    # Categorization
    status: str | None = None  # ongoing, completed, hiatus, cancelled
    genres: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    content_rating: str | None = None  # safe, suggestive, erotica

    # Media
    cover_url: str | None = None
    banner_url: str | None = None

    # Serialization
    year: int | None = None
    original_language: str | None = None

    # Chapters (may be paginated)
    chapters: list[ChapterMetadata] = field(default_factory=list)
    total_chapters: int | None = None

    # Provider attribution
    source_provider: str | None = None
    source_url: str | None = None
    last_updated: datetime = field(default_factory=datetime.utcnow)

    # Raw provider data (for debugging/extensibility)
    raw_data: dict[str, Any] = field(default_factory=dict, repr=False)


class MetadataProvider(ABC):
    """Abstract base class for manga metadata providers."""

    name: str
    base_url: str
    rate_limit_seconds: float = 1.0
    supports_search: bool = True
    supports_chapters: bool = True

    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> list[MangaMetadata]:
        """Search for manga by title. Returns normalized metadata."""
        pass

    @abstractmethod
    async def get_manga(self, provider_id: str) -> MangaMetadata | None:
        """Fetch full metadata for a specific manga by provider ID."""
        pass

    @abstractmethod
    async def get_chapters(
        self, provider_id: str, offset: int = 0, limit: int = 100
    ) -> list[ChapterMetadata]:
        """Fetch chapter list for a manga. May be paginated."""
        pass

    async def health_check(self) -> bool:
        """Check if provider is accessible. Override if needed."""
        return True
