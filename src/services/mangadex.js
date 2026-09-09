const axios = require('axios');

const MANGADEX_BASE = 'https://api.mangadex.org';

/**
 * Search for manga via MangaDex API
 */
async function searchManga(query, limit = 20) {
  try {
    const response = await axios.get(`${MANGADEX_BASE}/manga`, {
      params: {
        title: query,
        limit,
        'contentRating[]': ['safe', 'suggestive'],
        includes: ['cover_art']
      },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mangarr/0.1.0'
      }
    });
    return normalizeMangaList(response.data.data || []);
  } catch (error) {
    console.error('MangaDex search error:', error.message);
    return getMockSearchResults(query);
  }
}

/**
 * Get detailed manga info from MangaDex
 */
async function getMangaDetails(mangaId) {
  try {
    const response = await axios.get(`${MANGADEX_BASE}/manga/${mangaId}`, {
      params: { includes: ['cover_art'] },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mangarr/0.1.0'
      }
    });
    return normalizeManga(response.data.data);
  } catch (error) {
    console.error('MangaDex details error:', error.message);
    return getMockMangaDetails(mangaId);
  }
}

/**
 * Get cover image URL for a manga
 */
function getCoverUrl(manga) {
  if (!manga) return '';
  
  const coverRel = manga.relationships?.find(r => r.type === 'cover_art');
  const coverFilename = coverRel?.attributes?.fileName;
  const mangaId = manga.id;
  
  if (mangaId && coverFilename) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}`;
  }
  
  return '';
}

/**
 * Normalize manga data from MangaDex API format
 */
function normalizeManga(manga) {
  if (!manga) return null;
  
  const attrs = manga.attributes || {};
  const title = attrs.title?.en || attrs.title?.ja || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown';
  const altTitles = attrs.altTitles?.map(t => Object.values(t)[0]).filter(Boolean) || [];
  const description = attrs.description?.en || Object.values(attrs.description || {})[0] || '';
  const year = attrs.year || null;
  const status = attrs.status || 'unknown';
  const tags = attrs.tags?.map(t => t.attributes?.name?.en).filter(Boolean) || [];
  
  // Get authors/artists from relationships
  const authors = manga.relationships
    ?.filter(r => r.type === 'author')
    .map(r => r.attributes?.name)
    .filter(Boolean) || [];
  
  const artists = manga.relationships
    ?.filter(r => r.type === 'artist')
    .map(r => r.attributes?.name)
    .filter(Boolean) || [];
  
  return {
    id: manga.id,
    title,
    altTitles,
    description,
    coverUrl: getCoverUrl(manga),
    status,
    year,
    authors,
    artists,
    genres: tags,
    chaptersCount: attrs.lastChapter || 0,
    chapters: []
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
      coverUrl: '',
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
      coverUrl: '',
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
    coverUrl: '',
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
