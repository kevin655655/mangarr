"""Metadata providers for manga information."""

from mangarr.metadata.base import MangaMetadata, ChapterMetadata, MetadataProvider
from mangarr.metadata.registry import ProviderRegistry
from mangarr.metadata.service import MetadataService

__all__ = [
    "MangaMetadata",
    "ChapterMetadata",
    "MetadataProvider",
    "ProviderRegistry",
    "MetadataService",
]
