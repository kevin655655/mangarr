const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { importCbzMeta, readCbzMeta } = require('../services/cbz');

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

  // Helper: turn `undefined` into `null` for sqlite3 binds. Without this,
  // a missing optional field (e.g. related_manga) crashes with
  // SQLITE_MISE ("Statement cannot have undefined values") before any
  // INSERT happens. Strings still stringify as before; everything else
  // gets a sensible default.
  const json = (v) => (v === undefined ? null : JSON.stringify(v));
  const str = (v, d = '') => (v === undefined ? d : v);
  const num = (v, d = null) => (v === undefined || v === null || Number.isNaN(v) ? d : v);

  db.run(sql, [
    str(mangabaka_id),
    str(title),
    json(alt_titles),
    str(description),
    str(cover_url),
    str(status, 'unknown'),
    num(year),
    json(authors),
    json(artists),
    json(genres),
    num(chapters_count, 0),
    num(volumes_count, 0),
    str(content_rating, 'unknown'),
    str(demographic),
    str(original_language),
    str(publisher),
    str(magazine),
    num(rating),
    num(follows_count, 0),
    num(views_count, 0),
    str(last_updated),
    str(anilist_id),
    str(mal_id),
    str(official_website),
    str(raw_source_url),
    str(english_license_url),
    json(related_manga),
    json(recommendations),
    json(same_author_works)
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

// POST /api/library/import-cbz - Import manga metadata from a CBZ file
router.post('/import-cbz', (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    return res.status(404).json({ error: 'CBZ file not found' });
  }

  try {
    const imported = importCbzMeta(absPath);
    const meta = readCbzMeta(absPath);

    // Generate a synthetic mangabaka_id from the series title
    const syntheticId = 'cbz-' + Buffer.from(imported.manga.title || 'unknown').toString('base64url');

    res.json({
      message: 'CBZ metadata imported',
      mangabaka_id: syntheticId,
      manga: imported.manga,
      chapter: imported.chapter,
      comicInfo: meta
    });
  } catch (error) {
    console.error('CBZ import error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/library/:id/refresh-metadata - Refresh metadata from an on-disk CBZ
router.post('/:id/refresh-metadata', (req, res) => {
  const { filePath } = req.body;
  const mangaId = req.params.id;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    return res.status(404).json({ error: 'CBZ file not found' });
  }

  try {
    const imported = importCbzMeta(absPath);
    const manga = imported.manga;

    const sql = `
      UPDATE library SET
        title = COALESCE(NULLIF(?, ''), title),
        description = COALESCE(NULLIF(?, ''), description),
        authors = COALESCE(NULLIF(?, '[]'), authors),
        artists = COALESCE(NULLIF(?, '[]'), artists),
        genres = COALESCE(NULLIF(?, '[]'), genres),
        publisher = COALESCE(NULLIF(?, ''), publisher),
        content_rating = COALESCE(NULLIF(?, ''), content_rating),
        original_language = COALESCE(NULLIF(?, ''), original_language),
        rating = COALESCE(?, rating)
      WHERE id = ?
    `;

    db.run(sql, [
      manga.title,
      manga.description,
      JSON.stringify(manga.authors || []),
      JSON.stringify(manga.artists || []),
      JSON.stringify(manga.genres || []),
      manga.publisher,
      manga.contentRating,
      manga.originalLanguage,
      manga.rating,
      mangaId
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Manga not found in library' });
      }
      res.json({ message: 'Metadata refreshed from CBZ ComicInfo.xml' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
