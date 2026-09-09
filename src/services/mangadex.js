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
  
  // Extract tags with color coding info
  const tags = attrs.tags?.map(t => ({
    name: t.attributes?.name?.en,
    color: t.attributes?.group === 'genre' ? getGenreColor(t.attributes?.name?.en) : null
  })).filter(t => t.name) || [];
  
  const genres = tags.map(t => t.name);
  
  // Get content rating
  const contentRating = attrs.contentRating || 'unknown';
  
  // Get original language
  const originalLanguage = attrs.originalLanguage || '';
  
  // Get demographic from tags
  const demographicTag = attrs.tags?.find(t => t.attributes?.group === 'demographic');
  const demographic = demographicTag?.attributes?.name?.en || '';
  
  // Get authors/artists from relationships
  const authors = manga.relationships
    ?.filter(r => r.type === 'author')
    .map(r => r.attributes?.name)
    .filter(Boolean) || [];
  
  const artists = manga.relationships
    ?.filter(r => r.type === 'artist')
    .map(r => r.attributes?.name)
    .filter(Boolean) || [];
  
  // Build external links from MangaDex IDs
  const externalLinks = {};
  const anilistId = manga.links?.al || null;
  const malId = manga.links?.mal || null;
  if (anilistId) externalLinks.anilist = `https://anilist.co/manga/${anilistId}`;
  if (malId) externalLinks.mal = `https://myanimelist.net/manga/${malId}`;
  if (manga.links?.raw) externalLinks.raw = manga.links.raw;
  if (manga.links?.engtl) externalLinks.englishLicense = manga.links.engtl;
  if (manga.links?.mu) externalLinks.mangaupdates = `https://www.mangaupdates.com/series.html?id=${manga.links.mu}`;
  
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
    genres,
    tags,
    chaptersCount: attrs.lastChapter ? parseInt(attrs.lastChapter) : 0,
    volumesCount: attrs.lastVolume ? parseInt(attrs.lastVolume) : 0,
    chapters: [],
    contentRating,
    demographic,
    originalLanguage,
    publisher: '',
    magazine: '',
    rating: null,
    followsCount: 0,
    viewsCount: 0,
    lastUpdated: attrs.updatedAt || '',
    externalLinks,
    anilistId,
    malId,
    relatedManga: [],
    recommendations: [],
    sameAuthorWorks: []
  };
}

/**
 * Get a color for a genre tag (for UI color coding)
 */
function getGenreColor(genre) {
  const colors = {
    'Action': '#ff6b6b',
    'Adventure': '#48dbfb',
    'Comedy': '#feca57',
    'Drama': '#ff9ff3',
    'Fantasy': '#a29bfe',
    'Horror': '#576574',
    'Mahou Shoujo': '#ff9ff3',
    'Mecha': '#54a0ff',
    'Mystery': '#5f27cd',
    'Psychological': '#341f97',
    'Romance': '#ff6b81',
    'Sci-Fi': '#00d2d3',
    'Slice of Life': '#1dd1a1',
    'Sports': '#ee5a24',
    'Supernatural': '#9980fa',
    'Thriller': '#eb4d4b'
  };
  return colors[genre] || '#74b9ff';
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
      altTitles: ['サンプル漫画', 'Muestra de Manga'],
      description: 'A sample manga for testing purposes. This is a longer description that demonstrates how the collapsible description section will work in the UI.',
      coverUrl: '',
      status: 'ongoing',
      year: 2023,
      authors: ['Sample Author'],
      artists: ['Sample Artist'],
      genres: ['Action', 'Fantasy'],
      tags: [
        { name: 'Action', color: '#ff6b6b' },
        { name: 'Fantasy', color: '#a29bfe' }
      ],
      chaptersCount: 42,
      volumesCount: 5,
      contentRating: 'safe',
      demographic: 'shounen',
      originalLanguage: 'ja',
      publisher: 'Shueisha',
      magazine: 'Weekly Shonen Jump',
      rating: 8.5,
      followsCount: 12500,
      viewsCount: 450000,
      lastUpdated: '2024-03-15T10:30:00Z',
      externalLinks: {
        anilist: 'https://anilist.co/manga/12345',
        mal: 'https://myanimelist.net/manga/12345'
      },
      anilistId: '12345',
      malId: '12345'
    },
    {
      id: 'mock-2',
      title: `${query} - Another Manga`,
      altTitles: [],
      description: 'Another sample manga with a completed status.',
      coverUrl: '',
      status: 'completed',
      year: 2021,
      authors: ['Another Author'],
      artists: ['Another Artist'],
      genres: ['Romance', 'Slice of Life'],
      tags: [
        { name: 'Romance', color: '#ff6b81' },
        { name: 'Slice of Life', color: '#1dd1a1' }
      ],
      chaptersCount: 156,
      volumesCount: 14,
      contentRating: 'suggestive',
      demographic: 'seinen',
      originalLanguage: 'ja',
      publisher: 'Kodansha',
      magazine: 'Afternoon',
      rating: 7.8,
      followsCount: 8900,
      viewsCount: 320000,
      lastUpdated: '2023-12-01T00:00:00Z',
      externalLinks: {
        mal: 'https://myanimelist.net/manga/67890'
      },
      malId: '67890'
    }
  ];
}

function getMockMangaDetails(mangaId) {
  return {
    id: mangaId,
    title: 'Sample Manga Details',
    altTitles: ['詳細サンプル', 'Muestra de Detalles'],
    description: 'Detailed description of the manga. This is a comprehensive synopsis that covers the main plot points, character introductions, and world-building elements.\n\n**Story:** The protagonist embarks on an epic journey through a fantastical world filled with magic, mystery, and danger.\n\n*Second paragraph:* More details about the setting, themes, and narrative style.',
    coverUrl: '',
    status: 'ongoing',
    year: 2023,
    authors: ['Author Name'],
    artists: ['Artist Name'],
    genres: ['Action', 'Adventure'],
    tags: [
      { name: 'Action', color: '#ff6b6b' },
      { name: 'Adventure', color: '#48dbfb' },
      { name: 'Magic', color: '#a29bfe' }
    ],
    chaptersCount: 42,
    volumesCount: 5,
    contentRating: 'safe',
    demographic: 'shounen',
    originalLanguage: 'ja',
    publisher: 'Shueisha',
    magazine: 'Weekly Shonen Jump',
    rating: 8.5,
    followsCount: 12500,
    viewsCount: 450000,
    lastUpdated: '2024-03-15T10:30:00Z',
    externalLinks: {
      anilist: 'https://anilist.co/manga/12345',
      mal: 'https://myanimelist.net/manga/12345',
      official: 'https://example.com/official',
      raw: 'https://example.com/raw',
      englishLicense: 'https://example.com/english'
    },
    anilistId: '12345',
    malId: '12345',
    relatedManga: [
      { id: 'related-1', title: 'Spin-off Story', relation: 'spin-off' },
      { id: 'related-2', title: 'Prequel Series', relation: 'prequel' }
    ],
    recommendations: [
      { id: 'rec-1', title: 'Similar Manga A', reason: 'Same genre' },
      { id: 'rec-2', title: 'Similar Manga B', reason: 'Same author' }
    ],
    sameAuthorWorks: [
      { id: 'same-1', title: 'Previous Work' },
      { id: 'same-2', title: 'Another Series' }
    ],
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
