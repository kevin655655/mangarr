// API-backed data layer for Mangarr
// Falls back to mock data when API is unavailable

const API_BASE = window.location.origin + '/api/v1';

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetch failed:', err);
    return null;
  }
}

// Search metadata providers
async function searchMetadata(query, providers = null, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (providers) params.set('providers', providers.join(','));
  return await apiFetch(`/search?${params}`);
}

// Get manga details from a provider
async function getManga(provider, mangaId) {
  return await apiFetch(`/manga/${provider}/${mangaId}`);
}

// Get enabled providers
async function getProviders() {
  return await apiFetch('/providers');
}

// Health check
async function getHealth() {
  return await apiFetch('/health');
}

// Library data (placeholder until backend has real library)
const SERIES = window.MANGARR_DATA?.SERIES || [];
const WANTED = window.MANGARR_DATA?.WANTED || [];
const HISTORY = window.MANGARR_DATA?.HISTORY || [];
const SEARCH_RESULTS = window.MANGARR_DATA?.SEARCH_RESULTS || [];

function chaptersFor(series) {
  if (window.MANGARR_DATA?.chaptersFor) {
    return window.MANGARR_DATA.chaptersFor(series);
  }
  // Fallback stub
  const list = [];
  const total = Math.min(series.ch, 36);
  const startAt = Math.max(1, series.ch - total + 1);
  for (let i = 0; i < total; i++) {
    const n = startAt + i;
    list.push({
      n: String(n),
      vol: Math.floor((n - 1) / 6) + 1,
      title: `Chapter ${n}`,
      group: 'Unknown',
      size: '20 MB',
      age: '1d ago',
      have: n <= series.have,
      monitor: true,
      lang: 'en',
    });
  }
  return list.reverse();
}

window.MANGARR_API = {
  searchMetadata,
  getManga,
  getProviders,
  getHealth,
};

// Ensure MANGARR_DATA exists for components that need it
window.MANGARR_DATA = {
  SERIES,
  WANTED,
  HISTORY,
  SEARCH_RESULTS,
  chaptersFor,
  GROUPS: window.MANGARR_DATA?.GROUPS || [],
  STATUSES: window.MANGARR_DATA?.STATUSES || [],
};
