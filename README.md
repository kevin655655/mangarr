# Mangarr

A manga management webapp inspired by Sonarr/Radarr/Kapowarr. Search, track, and manage your manga collection with metadata from Mangabaka.

## Features

- 🔍 Search manga via Mangabaka API
- 📚 Library management
- ⬇️ Download queue (stubbed for future expansion)
- 🐳 Docker containerization
- 🚀 GitHub Actions CI/CD

## Quick Start

### Docker Compose

```bash
docker-compose up -d
```

Access the app at http://localhost:3000

### Development

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
mangarr/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # External API integrations
│   │   └── db/       # SQLite database
│   └── tests/        # Jest tests
├── frontend/         # React SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── .github/workflows/# CI/CD
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Backend port |
| DB_PATH | ./data/mangarr.db | SQLite database path |
| MANGABAKA_URL | https://api.mangabaka.com | Mangabaka API base URL |

## License

MIT
