"""FastAPI application factory and routes."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from mangarr.config import settings
from mangarr.metadata.service import MetadataService

# Global metadata service
metadata_service = MetadataService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await metadata_service.initialize()
    yield
    # Shutdown
    pass


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Mangarr",
        description="Manga management and automation service",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check
    @app.get("/health")
    async def health() -> dict[str, str | dict]:
        """Health check endpoint."""
        provider_health = await metadata_service.health_check()
        return {
            "status": "healthy",
            "providers": provider_health,
        }

    # Root
    @app.get("/")
    async def root() -> dict[str, str]:
        """Root endpoint."""
        return {
            "name": "Mangarr",
            "version": "0.1.0",
            "docs": "/docs",
        }

    # Metadata search
    @app.get("/api/v1/search")
    async def search_manga(
        q: str,
        providers: str | None = None,
        limit: int = 10,
    ) -> dict[str, list[dict]]:
        """Search for manga across metadata providers."""
        provider_list = providers.split(",") if providers else None

        results = await metadata_service.search(q, providers=provider_list, limit=limit)

        # Convert dataclasses to dicts for JSON serialization
        return {
            name: [
                {
                    "title": m.title,
                    "external_ids": m.external_ids,
                    "description": m.description,
                    "status": m.status,
                    "cover_url": m.cover_url,
                    "source_provider": m.source_provider,
                    "source_url": m.source_url,
                }
                for m in manga_list
            ]
            for name, manga_list in results.items()
        }

    # Get manga details
    @app.get("/api/v1/manga/{provider}/{manga_id}")
    async def get_manga(provider: str, manga_id: str) -> dict:
        """Get detailed manga information from a specific provider."""
        manga = await metadata_service.get_manga(provider, manga_id)

        if not manga:
            raise HTTPException(status_code=404, detail="Manga not found")

        return {
            "title": manga.title,
            "external_ids": manga.external_ids,
            "description": manga.description,
            "alternative_titles": manga.alternative_titles,
            "authors": manga.authors,
            "artists": manga.artists,
            "status": manga.status,
            "genres": manga.genres,
            "tags": manga.tags,
            "content_rating": manga.content_rating,
            "cover_url": manga.cover_url,
            "banner_url": manga.banner_url,
            "year": manga.year,
            "total_chapters": manga.total_chapters,
            "source_provider": manga.source_provider,
            "source_url": manga.source_url,
        }

    # List available providers
    @app.get("/api/v1/providers")
    async def list_providers() -> dict[str, list[str]]:
        """List available metadata providers."""
        return {
            "providers": list(metadata_service.providers.keys()),
        }

    # Mount static files for frontend
    static_path = Path(__file__).parent / "static"
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

    # Serve index.html at root
    @app.get("/", response_class=FileResponse)
    async def serve_index() -> str:
        return str(static_path / "index.html")

    return app
