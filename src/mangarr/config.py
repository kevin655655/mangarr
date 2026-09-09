"""Configuration management for Mangarr."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="MANGARR_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Directories
    config_dir: Path = Path("./config")
    data_dir: Path = Path("./data")

    # Server
    host: str = "0.0.0.0"
    port: int = 8787
    log_level: str = "info"

    # Metadata providers
    anilist_enabled: bool = True
    anilist_rate_limit: float = 1.0  # seconds between requests

    mangadex_enabled: bool = True
    mangadex_rate_limit: float = 0.5

    myanimelist_enabled: bool = False  # Requires API key
    myanimelist_client_id: str | None = None
    myanimelist_rate_limit: float = 1.0

    @property
    def config_path(self) -> Path:
        """Resolved config directory."""
        return self.config_dir.resolve()

    @property
    def data_path(self) -> Path:
        """Resolved data directory."""
        return self.data_dir.resolve()


# Global settings instance
settings = Settings()
