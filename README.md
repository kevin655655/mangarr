# Mangarr

A manga management and automation service, inspired by Sonarr, Radarr, and Kapowarr.

## Features

- **Metadata Aggregation** — Search and fetch manga info from AniList, MangaDex, and MyAnimeList
- **Chapter Tracking** — Monitor new releases (via MangaDex)
- **REST API** — Full API for integration with other tools
- **Docker Support** — Easy deployment with Docker Compose

## Quick Start (Docker)

### Prerequisites

- Docker & Docker Compose

### Run Locally (LAN Access)

```bash
cd ~/.openclaw/workspace/Mangarr

# Build and start
docker-compose up --build -d

# Or with explicit rebuild
docker-compose build --no-cache
docker-compose up -d
```

The service will be available at:
- **Local**: http://localhost:8787
- **LAN**: http://YOUR_IP:8787 (accessible from other devices on your network)

### Configuration

Create a `.env` file or set environment variables:

```bash
# Provider settings
MANGARR_ANILIST_ENABLED=true
MANGARR_ANILIST_RATE_LIMIT=1.0

MANGARR_MANGADEX_ENABLED=true
MANGARR_MANGADEX_RATE_LIMIT=0.5

# MyAnimeList requires a Client ID
# Get one at: https://myanimelist.net/apiconfig
MANGARR_MYANIMELIST_ENABLED=false
MANGARR_MYANIMELIST_CLIENT_ID=your_client_id_here
```

### Stop

```bash
docker-compose down
```

## Development

### Local Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Run locally
mangarr server
# or
python -m mangarr server
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Service info |
| `GET /health` | Health check + provider status |
| `GET /api/v1/providers` | List enabled providers |
| `GET /api/v1/search?q=query` | Search across providers |
| `GET /api/v1/manga/{provider}/{id}` | Get manga details |

### Example API Usage

```bash
# Search for manga
curl "http://localhost:8787/api/v1/search?q=one+piece&limit=5"

# Get details from AniList
curl "http://localhost:8787/api/v1/manga/anilist/30002"

# Get details from MangaDex
curl "http://localhost:8787/api/v1/manga/mangadex/32d76d19-8a05-4db0-9fc2-e0b606e39fbb"
```

## Project Structure

```
Mangarr/
├── src/mangarr/
│   ├── __init__.py
│   ├── api.py              # FastAPI routes
│   ├── cli.py              # CLI entry point
│   ├── config.py           # Settings management
│   ├── main.py             # App factory
│   └── metadata/           # Metadata providers
│       ├── base.py         # Abstract base classes
│       ├── registry.py     # Provider registration
│       ├── service.py      # Unified service
│       └── providers/
│           ├── anilist.py
│           ├── mangadex.py
│           └── myanimelist.py
├── docs/
│   └── metadata-providers.md
├── tests/
├── config/                 # Runtime config (mounted volume)
├── data/                   # Runtime data (mounted volume)
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Documentation

- [Metadata Providers](docs/metadata-providers.md) — Architecture and provider details

## License

GPL-3.0
