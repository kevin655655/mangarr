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

export default api;
