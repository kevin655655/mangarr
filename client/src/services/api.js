import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const searchManga = (query) => api.get(`/manga/search?q=${encodeURIComponent(query)}`);
export const getMangaDetails = (id) => api.get(`/manga/${id}`);
export const getLibrary = () => api.get('/library');

/**
 * Translate a normalized manga object (camelCase, with array-of-objects
 * fields) into the snake_case / JSON-stringified shape the
 * POST /api/library route expects. Sending raw manga directly caused
 * the server to bind `undefined` for missing fields, which sqlite3
 * rejects with SQLITE_MISE.
 */
function toLibraryRow(manga) {
  return {
    mangabaka_id: String(manga.id ?? manga.mangabaka_id ?? ''),
    title: manga.title || '',
    alt_titles: JSON.stringify(manga.altTitles || manga.alt_titles || []),
    description: manga.description || '',
    cover_url: manga.coverUrl || manga.cover_url || '',
    status: manga.status || 'unknown',
    year: manga.year ?? null,
    authors: JSON.stringify(manga.authors || []),
    artists: JSON.stringify(manga.artists || []),
    genres: JSON.stringify(manga.genres || []),
    chapters_count: manga.chaptersCount ?? manga.chapters_count ?? 0,
    volumes_count: manga.volumesCount ?? manga.volumes_count ?? 0,
    content_rating: manga.contentRating || manga.content_rating || 'unknown',
    demographic: manga.demographic || '',
    original_language: manga.originalLanguage || manga.original_language || '',
    publisher: manga.publisher || '',
    magazine: manga.magazine || '',
    rating: manga.rating ?? null,
    follows_count: manga.followsCount ?? manga.follows_count ?? 0,
    views_count: manga.viewsCount ?? manga.views_count ?? 0,
    last_updated: manga.lastUpdated || manga.last_updated || '',
    anilist_id: String(manga.anilistId ?? manga.anilist_id ?? ''),
    mal_id: String(manga.malId ?? manga.mal_id ?? ''),
    official_website: manga.officialWebsite || manga.official_website || '',
    raw_source_url: manga.rawSourceUrl || manga.raw_source_url || '',
    english_license_url: manga.englishLicenseUrl || manga.english_license_url || '',
    related_manga: JSON.stringify(manga.relatedManga || manga.related_manga || []),
    recommendations: JSON.stringify(manga.recommendations || []),
    same_author_works: JSON.stringify(manga.sameAuthorWorks || manga.same_author_works || [])
  };
}

export const addToLibrary = (manga) => api.post('/library', toLibraryRow(manga));
export const removeFromLibrary = (id) => api.delete(`/library/${id}`);
export const getDownloads = () => api.get('/downloads');
export const queueDownload = (data) => api.post('/downloads', data);

// Settings API
export const getSettings = () => api.get('/settings');
export const getSettingsCategory = (category) => api.get(`/settings/${category}`);
export const updateSettings = (settings) => api.put('/settings', settings);
export const updateSettingsCategory = (category, data) => api.patch(`/settings/${category}`, data);
export const resetSettings = (category) => api.post('/settings/reset', category ? { category } : {});
export const exportSettings = () => api.get('/settings/export', { responseType: 'blob' });
export const importSettings = (settings) => api.post('/settings/import', { settings });

/**
 * Proxy an external image URL through the backend to bypass CORS/referrer restrictions
 * @param {string} url - The external image URL to proxy
 * @returns {string} - The proxied URL
 */
export const getProxiedImageUrl = (url) => {
  if (!url) return '';
  // Don't proxy data URIs or already-proxied URLs
  if (url.startsWith('data:') || url.startsWith('/api/proxy/')) return url;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
};

export default api;
