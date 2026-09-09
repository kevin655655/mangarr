const axios = require('axios');

const MANGABAKA_BASE = process.env.MANGABAKA_URL || 'https://api.mangabaka.org';

/**
 * Search for manga via Mangabaka API
 * Falls back to mock data if the API is unavailable
 */
async function searchManga(query, limit = 20) {
  try {
    const response = await axios.get(`${MANGABAKA_BASE}/v1/series/search`, {
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
    const response = await axios.get(`${MANGABAKA_BASE}/v1/series/${mangaId}`, {
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

/* Mock data for development when API is unavailable */
function getMockSearchResults(query) {
  return [
    {
      id: 'mock-1',
      title: `${query} - Sample Manga`,
      altTitles: ['サンプル漫画', 'Muestra de Manga'],
      description: 'A sample manga for testing purposes. This is a longer description that demonstrates how the collapsible description section will work in the UI. It contains multiple sentences to show the truncation and expand functionality.',
      coverUrl: '',
      status: 'ongoing',
      year: 2023,
      authors: ['Sample Author'],
      artists: ['Sample Artist'],
      genres: ['Action', 'Fantasy'],
      tags: [
        { name: 'Action', color: '#ff6b6b' },
        { name: 'Fantasy', color: '#4ecdc4' }
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
        official: 'https://example.com/official'
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
        { name: 'Romance', color: '#ff9ff3' },
        { name: 'Slice of Life', color: '#feca57' }
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
    description: 'Detailed description of the manga. This is a comprehensive synopsis that covers the main plot points, character introductions, and world-building elements. It is designed to be long enough to test the collapsible description component.\n\n**Story:** The protagonist embarks on an epic journey through a fantastical world filled with magic, mystery, and danger. Along the way, they meet allies, face formidable enemies, and discover hidden truths about their own identity.\n\n*Second paragraph:* More details about the setting, themes, and narrative style of the manga.',
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
