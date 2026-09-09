# Metadata Providers

Mangarr aggregates manga metadata from multiple external sources. This document describes the provider architecture, trade-offs, and implementation details.

## Overview

Metadata providers are the bridge between Mangarr and external manga databases. They normalize disparate data formats into a consistent internal representation.

### Supported Providers

| Provider | Search | Chapters | Auth Required | Rate Limit |
|----------|--------|----------|---------------|------------|
| **AniList** | ✅ | ❌ | No | 1 req/sec |
| **MangaDex** | ✅ | ✅ | No | 0.5 req/sec |
| **MyAnimeList** | ✅ | ❌ | Yes (Client ID) | 1 req/sec |

## Architecture

```
┌─────────────────┐
│  MetadataService │  ← Unified interface
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────┐  ┌─────────┐
│AniList│  │MangaDex│  │   MAL   │
└───────┘  └────────┘  └─────────┘
```

### Key Components

1. **`MetadataProvider` (ABC)** — Base class all providers implement
2. **`ProviderRegistry`** — Auto-registration via decorator
3. **`MetadataService`** — Aggregates searches, handles initialization
4. **Normalized Types** — `MangaMetadata`, `ChapterMetadata`

## Provider Details

### AniList

- **API**: GraphQL (`https://graphql.anilist.co`)
- **Strengths**: Comprehensive metadata, no auth, good cover images
- **Weaknesses**: No chapter data, occasional stale information
- **IDs**: Integer (e.g., `30002`)

### MangaDex

- **API**: REST (`https://api.mangadex.org`)
- **Strengths**: Chapter lists, scanlation groups, multiple languages
- **Weaknesses**: Complex relationship structure, occasional API instability
- **IDs**: UUID (e.g., `f8c3f57c-4a1c-4c3f-8c3f-57c4a1c4c3f8`)

### MyAnimeList

- **API**: REST (`https://api.myanimelist.net/v2`)
- **Strengths**: Large database, community ratings
- **Weaknesses**: Requires API key, no chapter data, rate limits
- **IDs**: Integer (e.g., `1`)

## ID Normalization

Each provider uses different ID schemes. Mangarr stores them in `external_ids`:

```python
{
    "anilist": "30002",
    "mangadex": "f8c3f57c-4a1c-4c3f-8c3f-57c4a1c4c3f8",
    "mal": "1"
}
```

Cross-referencing between providers is a future enhancement.

## Rate Limiting

Each provider implements client-side rate limiting to avoid bans:

```python
# AniList: 1 second between requests
# MangaDex: 0.5 seconds between requests
# MAL: 1 second between requests
```

Rate limits are configurable via environment variables:

```bash
MANGARR_ANILIST_RATE_LIMIT=1.0
MANGARR_MANGADEX_RATE_LIMIT=0.5
MANGARR_MAL_RATE_LIMIT=1.0
```

## Content Rating Mapping

Providers use different rating systems. Mangarr normalizes to:

- `safe` — All ages
- `suggestive` — Mild fan service, ecchi
- `erotica` — Adult content, hentai

## Adding a New Provider

1. Create a new file in `src/mangarr/metadata/providers/`
2. Subclass `MetadataProvider`
3. Implement required methods: `search()`, `get_manga()`, `get_chapters()`
4. Add `@register_provider("name")` decorator
5. Import in `src/mangarr/metadata/service.py` to enable

Example:

```python
from mangarr.metadata.base import MangaMetadata, MetadataProvider
from mangarr.metadata.registry import register_provider

@register_provider("example")
class ExampleProvider(MetadataProvider):
    name = "example"
    base_url = "https://api.example.com"
    rate_limit_seconds = 1.0

    async def search(self, query: str, limit: int = 10) -> list[MangaMetadata]:
        # Implementation
        pass

    async def get_manga(self, provider_id: str) -> MangaMetadata | None:
        # Implementation
        pass

    async def get_chapters(self, provider_id: str, offset: int = 0, limit: int = 100):
        # Implementation
        pass
```

## Future Enhancements

- [ ] Cross-provider ID mapping
- [ ] Caching layer for metadata
- [ ] Background metadata refresh
- [ ] Additional providers (Kitsu, ComicVine, etc.)
- [ ] Chapter hash verification (for deduplication)
