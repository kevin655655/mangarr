const axios = require('axios');

// Module-level fallback only. The real baseURL is resolved per call from
// the Settings page (DB) so the operator's edits there are authoritative.
// `MANGABAKA_URL` env var is honored as a last-resort fallback for
// unattended/headless runs and for the docker-compose default.
const ENV_FALLBACK = process.env.MANGABAKA_URL || 'https://api.mangabaka.org';

/**
 * Resolve the active Mangabaka base URL.
 *
 * Order of precedence (highest first):
 *   1. Settings page value `settings.sources.mangabakaUrl` (DB)
 *   2. `process.env.MANGABAKA_URL` (env var)
 *   3. Hard-coded default `https://api.mangabaka.org`
 *
 * This is called once per public API call so a Settings-page edit
 * takes effect immediately on the next request. If the DB read
 * fails for any reason, we fall back to the env var and log a
 * warning — never silently swallow the failure.
 */
async function resolveBaseURL() {
  try {
    const db = require('../db/database');
    await db.waitForInit();
    const settings = await db.getSettings();
    const url = settings && settings.sources && settings.sources.mangabakaUrl;
    if (url && typeof url === 'string') return url;
    return ENV_FALLBACK;
  } catch (e) {
    console.warn('[mangabaka] failed to read mangabakaUrl from settings, falling back to env/default:', e.message);
    return ENV_FALLBACK;
  }
}

/**
 * Build a fresh axios instance bound to the given baseURL.
 * Timeout, IPv4 family pin, and headers are kept identical to the
 * previous module-level client.
 *
 * The IPv4 pin is intentional and stays: the Cloudflare anycast that
 * backs api.mangabaka.org returns IPs that some older OpenSSL builds
 * (notably the one bundled with the node:20-alpine image) can't
 * negotiate during the TLS handshake, producing
 *   EPROTO ... ssl3_read_bytes: tlsv1 unrecognized name
 * Pinning to IPv4 avoids that path on otherwise-broken images.
 */
function buildClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mangarr/0.1.0'
    },
    family: 4
  });
}

/**
 * Search for manga via Mangabaka API.
 *
 * URL is resolved fresh from settings on every call (env var is only
 * a fallback). Throws on real API failure - callers (routes) are
 * responsible for any user-facing fallback, not this service.
 * Returning mock data on API errors masks configuration and
 * connectivity bugs.
 */
async function searchManga(query, limit = 20) {
  const baseURL = await resolveBaseURL();
  const http = buildClient(baseURL);
  const response = await http.get('/v1/series/search', {
    params: { q: query, limit }
  });
  const data = response.data;
  // Mangabaka returns either { data: [...] } or a bare array depending
  // on the endpoint. Normalize both.
  const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  return normalizeMangaList(list);
}

/**
 * Get detailed manga info from Mangabaka.
 *
 * URL is resolved fresh from settings on every call (env var is only
 * a fallback).
 */
async function getMangaDetails(mangaId) {
  const baseURL = await resolveBaseURL();
  const http = buildClient(baseURL);
  const response = await http.get(`/v1/series/${encodeURIComponent(mangaId)}`);
  const data = response.data;
  const raw = Array.isArray(data) ? data[0] : (data?.data ?? data);
  return normalizeManga(raw);
}

/**
 * Normalize manga data from Mangabaka API format to a consistent structure
 */
function normalizeManga(manga) {
  if (!manga) return null;

  // Extract cover URL from the cover object
  let coverUrl = '';
  if (manga.cover) {
    // Prefer x350 size, fallback to x250, then x150, then raw
    coverUrl = manga.cover.x350?.x1 ||
               manga.cover.x250?.x1 ||
               manga.cover.x150?.x1 ||
               manga.cover.raw?.url ||
               '';
  }

  // Extract all alternative titles from various language fields
  const altTitles = [];
  if (manga.secondary_titles) {
    Object.values(manga.secondary_titles).forEach(langGroup => {
      if (Array.isArray(langGroup)) {
        langGroup.forEach(t => {
          if (t.title) altTitles.push(t.title);
        });
      }
    });
  }

  // Extract tags with color coding info if available
  const genres = manga.genres || [];
  const tags = manga.tags?.map(t => ({
    name: typeof t === 'string' ? t : t.name,
    color: t.color || null
  })) || genres.map(g => ({ name: g, color: null }));

  // Build external links
  const externalLinks = {};
  if (manga.anilist_id) externalLinks.anilist = `https://anilist.co/manga/${manga.anilist_id}`;
  if (manga.mal_id) externalLinks.mal = `https://myanimelist.net/manga/${manga.mal_id}`;
  if (manga.official_website) externalLinks.official = manga.official_website;
  if (manga.raw_source_url) externalLinks.raw = manga.raw_source_url;
  if (manga.english_license_url) externalLinks.englishLicense = manga.english_license_url;

  return {
    id: manga.id?.toString() || '',
    title: manga.title || manga.native_title || 'Unknown',
    altTitles: [...new Set(altTitles)],
    description: manga.description || manga.summary || '',
    coverUrl: coverUrl,
    status: manga.status || 'unknown',
    year: manga.year || null,
    authors: manga.authors || [],
    artists: manga.artists || [],
    genres: genres,
    tags: tags,
    chaptersCount: manga.total_chapters ? parseInt(manga.total_chapters) : 0,
    volumesCount: manga.total_volumes ? parseInt(manga.total_volumes) : 0,
    chapters: [],
    rating: manga.rating || manga.score || null,
    contentRating: manga.content_rating || 'unknown',
    demographic: manga.demographic || '',
    originalLanguage: manga.original_language || manga.language || '',
    publisher: manga.publisher || '',
    magazine: manga.magazine || manga.serialization || '',
    followsCount: manga.follows || manga.followers || 0,
    viewsCount: manga.views || manga.hits || 0,
    lastUpdated: manga.last_updated || manga.updated_at || '',
    externalLinks: externalLinks,
    anilistId: manga.anilist_id || null,
    malId: manga.mal_id || null,
    relatedManga: manga.related_manga || [],
    recommendations: manga.recommendations || [],
    sameAuthorWorks: manga.same_author_works || []
  };
}

function normalizeMangaList(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.map(normalizeManga).filter(Boolean);
}

module.exports = {
  searchManga,
  getMangaDetails,
  normalizeManga
};
