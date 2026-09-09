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
    chapters_count,
    volumes_count,
    content_rating,
    demographic,
    original_language,
    publisher,
    magazine,
    rating,
    follows_count,
    views_count,
    last_updated,
    anilist_id,
    mal_id,
    official_website,
    raw_source_url,
    english_license_url,
    related_manga,
    recommendations,
    same_author_works
  } = req.body;

  if (!mangabaka_id || !title) {
    return res.status(400).json({ error: 'mangabaka_id and title are required' });
  }

  const sql = `
    INSERT INTO library (
      mangabaka_id, title, alt_titles, description, cover_url, status, year,
      authors, artists, genres, chapters_count, volumes_count, content_rating,
      demographic, original_language, publisher, magazine, rating, follows_count,
      views_count, last_updated, anilist_id, mal_id, official_website,
      raw_source_url, english_license_url, related_manga, recommendations, same_author_works
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(mangabaka_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      cover_url = excluded.cover_url,
      status = excluded.status,
      year = excluded.year,
      chapters_count = excluded.chapters_count,
      volumes_count = excluded.volumes_count,
      content_rating = excluded.content_rating,
      demographic = excluded.demographic,
      original_language = excluded.original_language,
      publisher = excluded.publisher,
      magazine = excluded.magazine,
      rating = excluded.rating,
      follows_count = excluded.follows_count,
      views_count = excluded.views_count,
      last_updated = excluded.last_updated,
      anilist_id = excluded.anilist_id,
      mal_id = excluded.mal_id,
      official_website = excluded.official_website,
      raw_source_url = excluded.raw_source_url,
      english_license_url = excluded.english_license_url,
      related_manga = excluded.related_manga,
      recommendations = excluded.recommendations,
      same_author_works = excluded.same_author_works
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
    chapters_count || 0,
    volumes_count || 0,
    content_rating || 'unknown',
    demographic || '',
    original_language || '',
    publisher || '',
    magazine || '',
    rating || null,
    follows_count || 0,
    views_count || 0,
    last_updated || '',
    anilist_id || '',
    mal_id || '',
    official_website || '',
    raw_source_url || '',
    english_license_url || '',
    JSON.stringify(related_manga || []),
    JSON.stringify(recommendations || []),
    JSON.stringify(same_author_works || [])
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
