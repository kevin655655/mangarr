# Mangarr

A manga management webapp inspired by Sonarr/Radarr/Kapowarr. Search, track, and manage your manga collection with metadata from Mangabaka.

## Features

- 🔍 Search manga via Mangabaka API
- 📚 Library management
- ⬇️ Download queue (stubbed for future expansion)
- 🐳 Single-container Docker deployment
- 🚀 GitHub Actions CI/CD

## Quick Start

### Docker Compose

```bash
docker-compose up -d
```

Access the app at http://localhost:3000

### Development

```bash
# Install dependencies
npm install
cd client && npm install

# Run dev server (backend + frontend)
npm run dev
```

## Project Structure

```
mangarr/
├── src/              # Express backend
│   ├── routes/       # API routes
│   ├── services/     # External API integrations
│   └── db/           # SQLite database
├── client/           # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── tests/            # Jest tests
└── .github/workflows/# CI/CD
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| DB_PATH | ./data/mangarr.db | SQLite database path |
| MANGABAKA_URL | https://api.mangabaka.com | Mangabaka API base URL |

## License

MIT
