"""Main application entry point."""

import uvicorn

from mangarr.api import create_app
from mangarr.config import settings

app = create_app()


def main() -> None:
    """Run the application."""
    uvicorn.run(
        "mangarr.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )


if __name__ == "__main__":
    main()
