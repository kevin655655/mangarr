"""Provider registry for managing metadata sources."""

from typing import Type
from mangarr.metadata.base import MetadataProvider


class ProviderRegistry:
    """Registry for metadata provider classes."""

    _providers: dict[str, Type[MetadataProvider]] = {}

    @classmethod
    def register(cls, name: str, provider_class: Type[MetadataProvider]) -> None:
        """Register a provider class."""
        cls._providers[name.lower()] = provider_class

    @classmethod
    def get(cls, name: str) -> Type[MetadataProvider] | None:
        """Get a provider class by name."""
        return cls._providers.get(name.lower())

    @classmethod
    def list_providers(cls) -> list[str]:
        """List all registered provider names."""
        return list(cls._providers.keys())

    @classmethod
    def create(cls, name: str, **kwargs) -> MetadataProvider | None:
        """Instantiate a provider by name with given config."""
        provider_class = cls.get(name)
        if provider_class:
            return provider_class(**kwargs)
        return None


def register_provider(name: str):
    """Decorator to register a provider class."""

    def decorator(cls: Type[MetadataProvider]) -> Type[MetadataProvider]:
        ProviderRegistry.register(name, cls)
        return cls

    return decorator
