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
export const addToLibrary = (manga) => api.post('/library', manga);
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
