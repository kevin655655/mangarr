const axios = require('axios');

const MANGABAKA_BASE = process.env.MANGABAKA_URL || 'https://api.mangabaka.com';

/**
 * Search for manga via Mangabaka API
 * Falls back to mock data if the API is unavailable
 */
async function searchManga(query, limit = 20) {
  try {
    const response = await axios.get(`${MANGABAKA_BASE}/manga`, {
      params: { q: query, limit },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mangarr/0.1.0'
      }
    });
    return normalizeMangaList(response.data.data || response.data || []);
  } catch (error) {
    console.error('Mangabaka search error:', error.message);
    // Return mock data for development if API is unavailable
    return getMockSearchResults(query);
  }
}

/**
 * Get detailed manga info from Mangabaka
 */
async function getMangaDetails(mangaId) {
  try {
    const response = await axios.get(`${MANGABAKA_BASE}/manga/${mangaId}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mangarr/0.1.0'
      }
    });
    return normalizeManga(response.data.data || response.data);
  } catch (error) {
    console.error('Mangabaka details error:', error.message);
    return getMockMangaDetails(mangaId);
  }
}

/**
 * Normalize manga data from various API formats to a consistent structure
 */
function normalizeManga(manga) {
  if (!manga) return null;
  return {
    id: manga.id || manga.mangaId || manga.slug,
    title: manga.title || manga.name || 'Unknown',
    altTitles: manga.altTitles || manga.alt_titles || manga.altTitle || [],
    description: manga.description || manga.summary || manga.synopsis || '',
    coverUrl: manga.coverUrl || manga.cover_url || manga.cover || manga.thumbnail || manga.image || '',
    status: manga.status || manga.publicationStatus || 'unknown',
    year: manga.year || manga.releaseYear || manga.startDate,
    authors: manga.authors || manga.author || manga.writer || [],
    artists: manga.artists || manga.artist || [],
    genres: manga.genres || manga.tags || manga.categories || [],
    chaptersCount: manga.chaptersCount || manga.chapter_count || manga.chapters?.length || 0,
    chapters: manga.chapters || []
  };
}

function normalizeMangaList(mangaList) {
  if (!Array.isArray(mangaList)) return [];
  return mangaList.map(normalizeManga).filter(Boolean);
}

/* Mock data for development when API is unavailable */
function getMockSearchResults(query) {
  return [
    {
      id: 'mock-1',
      title: `${query} - Sample Manga`,
      altTitles: ['サンプル漫画'],
      description: 'A sample manga for testing purposes.',
      coverUrl: 'https://via.placeholder.com/300x450/3b82f6/ffffff?text=Sample+Manga',
      status: 'ongoing',
      year: 2023,
      authors: ['Sample Author'],
      artists: ['Sample Artist'],
      genres: ['Action', 'Fantasy'],
      chaptersCount: 42
    },
    {
      id: 'mock-2',
      title: `${query} - Another Manga`,
      altTitles: [],
      description: 'Another sample manga.',
      coverUrl: 'https://via.placeholder.com/300x450/10b981/ffffff?text=Another+Manga',
      status: 'completed',
      year: 2021,
      authors: ['Another Author'],
      artists: ['Another Artist'],
      genres: ['Romance', 'Slice of Life'],
      chaptersCount: 156
    }
  ];
}

function getMockMangaDetails(mangaId) {
  return {
    id: mangaId,
    title: 'Sample Manga Details',
    altTitles: ['詳細サンプル'],
    description: 'Detailed description of the manga.',
    coverUrl: 'https://via.placeholder.com/300x450/8b5cf6/ffffff?text=Manga+Details',
    status: 'ongoing',
    year: 2023,
    authors: ['Author Name'],
    artists: ['Artist Name'],
    genres: ['Action', 'Adventure'],
    chaptersCount: 42,
    chapters: [
      { number: 1, title: 'Chapter 1: The Beginning', volume: 1 },
      { number: 2, title: 'Chapter 2: The Journey', volume: 1 },
      { number: 3, title: 'Chapter 3: The Conflict', volume: 1 }
    ]
  };
}

module.exports = {
  searchManga,
  getMangaDetails,
  normalizeManga
};
