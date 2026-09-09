const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/library - List all manga in library
router.get('/', (req, res) => {
  db.all('SELECT * FROM library ORDER BY added_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ library: rows });
  });
});

// POST /api/library - Add manga to library
router.post('/', (req, res) => {
  const {
    mangabaka_id,
    title,
    alt_titles,
    description,
    cover_url,
    status,
    year,
    authors,
    artists,
    genres,
    chapters_count
  } = req.body;

  if (!mangabaka_id || !title) {
    return res.status(400).json({ error: 'mangabaka_id and title are required' });
  }

  const sql = `
    INSERT INTO library (mangabaka_id, title, alt_titles, description, cover_url, status, year, authors, artists, genres, chapters_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(mangabaka_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      cover_url = excluded.cover_url,
      status = excluded.status,
      chapters_count = excluded.chapters_count
  `;

  db.run(sql, [
    mangabaka_id,
    title,
    JSON.stringify(alt_titles || []),
    description || '',
    cover_url || '',
    status || 'unknown',
    year || null,
    JSON.stringify(authors || []),
    JSON.stringify(artists || []),
    JSON.stringify(genres || []),
    chapters_count || 0
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Manga added to library' });
  });
});

// DELETE /api/library/:id - Remove manga from library
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM library WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Manga not found in library' });
    }
    res.json({ message: 'Manga removed from library' });
  });
});

module.exports = router;
