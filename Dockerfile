FROM python:3.12-slim-bookworm AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir -e "."

# Copy application code
COPY src/ ./src/

# Re-install in editable mode with the source present
RUN pip install --no-cache-dir -e "."

# Expose the application port
EXPOSE 8787

# Run as non-root user
RUN useradd -m -u 1000 mangarr && chown -R mangarr:mangarr /app
USER mangarr

# Default command
CMD ["mangarr", "server", "--host", "0.0.0.0", "--port", "8787"]
