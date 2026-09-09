const express = require('express');
const router = express.Router();
const { searchManga, getMangaDetails } = require('../services/mangabaka');

// GET /api/manga/search?q=query
router.get('/search', async (req, res) => {
  const { q, limit } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  try {
    const results = await searchManga(q, limit ? parseInt(limit) : 20);
    res.json({ results });
  } catch (error) {
    // 502 (Bad Gateway) is the right code when the *upstream* (Mangabaka)
    // is the failing party. 500 would imply our own backend is broken,
    // which misleads operators and hides infrastructure problems.
    res.status(502).json({
      error: 'upstream_unavailable',
      message: error.message,
      query: { q, limit: limit ? parseInt(limit) : 20 }
    });
  }
});

// GET /api/manga/:id
router.get('/:id', async (req, res) => {
  try {
    const manga = await getMangaDetails(req.params.id);
    res.json({ manga });
  } catch (error) {
    res.status(502).json({
      error: 'upstream_unavailable',
      message: error.message,
      mangaId: req.params.id
    });
  }
});

// GET /api/manga/:id/enriched - enriched details with external links resolution
router.get('/:id/enriched', async (req, res) => {
  try {
    const manga = await getMangaDetails(req.params.id);
    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    // Build enriched external links
    const enrichedLinks = {
      anilist: manga.externalLinks?.anilist || (manga.anilistId ? `https://anilist.co/manga/${manga.anilistId}` : null),
      mal: manga.externalLinks?.mal || (manga.malId ? `https://myanimelist.net/manga/${manga.malId}` : null),
      official: manga.externalLinks?.official || null,
      raw: manga.externalLinks?.raw || manga.rawSourceUrl || null,
      englishLicense: manga.externalLinks?.englishLicense || manga.englishLicenseUrl || null
    };

    // Filter out null links
    Object.keys(enrichedLinks).forEach(key => {
      if (!enrichedLinks[key]) delete enrichedLinks[key];
    });

    // Build related content
    const relatedContent = {
      relatedManga: manga.relatedManga || [],
      recommendations: manga.recommendations || [],
      sameAuthorWorks: manga.sameAuthorWorks || []
    };

    const enriched = {
      ...manga,
      enrichedLinks,
      relatedContent,
      metadataComplete: true
    };

    res.json({ manga: enriched });
  } catch (error) {
    res.status(502).json({
      error: 'upstream_unavailable',
      message: error.message,
      mangaId: req.params.id
    });
  }
});

module.exports = router;
