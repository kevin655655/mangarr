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
    res.status(500).json({ error: error.message });
  }
});

// GET /api/manga/:id
router.get('/:id', async (req, res) => {
  try {
    const manga = await getMangaDetails(req.params.id);
    res.json({ manga });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
