"""Command-line interface for Mangarr."""

import argparse
import sys

from mangarr.config import settings
from mangarr.main import main as run_server


def main() -> int:
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="mangarr",
        description="Manga management and automation service",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.1.0",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Server command
    server_parser = subparsers.add_parser("server", help="Run the web server")
    server_parser.add_argument(
        "--host",
        default=settings.host,
        help=f"Host to bind to (default: {settings.host})",
    )
    server_parser.add_argument(
        "--port",
        type=int,
        default=settings.port,
        help=f"Port to bind to (default: {settings.port})",
    )

    args = parser.parse_args()

    if args.command == "server" or args.command is None:
        # Override settings with CLI args
        settings.host = args.host
        settings.port = args.port
        run_server()
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
