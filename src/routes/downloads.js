const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { createCbz } = require('../services/cbz');

// GET /api/downloads - List all downloads
router.get('/', (req, res) => {
  const sql = `
    SELECT d.*, l.title as manga_title, l.cover_url
    FROM downloads d
    JOIN library l ON d.manga_id = l.id
    ORDER BY d.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ downloads: rows });
  });
});

// POST /api/downloads - Queue a download
router.post('/', (req, res) => {
  const { manga_id, chapter_number, chapter_title } = req.body;

  if (!manga_id) {
    return res.status(400).json({ error: 'manga_id is required' });
  }

  const sql = `
    INSERT INTO downloads (manga_id, chapter_number, chapter_title, status)
    VALUES (?, ?, ?, 'pending')
  `;

  db.run(sql, [manga_id, chapter_number || null, chapter_title || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      message: 'Download queued',
      status: 'pending'
    });
  });
});

// PATCH /api/downloads/:id - Update download status
router.patch('/:id', (req, res) => {
  const { status, progress } = req.body;
  const updates = [];
  const values = [];

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (progress !== undefined) {
    updates.push('progress = ?');
    values.push(progress);
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  const sql = `UPDATE downloads SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Download not found' });
    }
    res.json({ message: 'Download updated' });
  });
});

// POST /api/downloads/:id/package - Package downloaded images into CBZ with ComicInfo.xml
router.post('/:id/package', async (req, res) => {
  const downloadId = req.params.id;

  // Fetch download + manga metadata
  const sql = `
    SELECT d.*, l.title, l.description, l.authors, l.artists, l.genres,
           l.publisher, l.content_rating, l.original_language, l.rating,
           l.volumes_count, l.magazine, l.official_website, l.raw_source_url,
           l.english_license_url, l.related_manga, l.same_author_works
    FROM downloads d
    JOIN library l ON d.manga_id = l.id
    WHERE d.id = ?
  `;

  db.get(sql, [downloadId], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Download not found' });
    }

    const { imagePaths, outputPath } = req.body;
    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      return res.status(400).json({ error: 'imagePaths array is required' });
    }
    if (!outputPath) {
      return res.status(400).json({ error: 'outputPath is required' });
    }

    try {
      const manga = {
        title: row.title,
        description: row.description || '',
        authors: safeJsonParse(row.authors),
        artists: safeJsonParse(row.artists),
        genres: safeJsonParse(row.genres),
        publisher: row.publisher || '',
        contentRating: row.content_rating || 'unknown',
        originalLanguage: row.original_language || '',
        rating: row.rating,
        volumesCount: row.volumes_count || 0,
        magazine: row.magazine || '',
        externalLinks: {
          official: row.official_website || '',
          raw: row.raw_source_url || '',
          englishLicense: row.english_license_url || ''
        },
        relatedManga: safeJsonParse(row.related_manga),
        sameAuthorWorks: safeJsonParse(row.same_author_works)
      };

      const chapter = {
        title: row.chapter_title || row.title,
        number: row.chapter_number,
        volume: null
      };

      const cbzPath = createCbz(imagePaths, outputPath, { manga, chapter });

      // Update download record with file path
      db.run(
        'UPDATE downloads SET file_path = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [cbzPath, 'completed', downloadId],
        (updateErr) => {
          if (updateErr) {
            console.error('Failed to update download record:', updateErr.message);
          }
        }
      );

      res.json({
        message: 'CBZ created with ComicInfo.xml',
        filePath: cbzPath,
        pageCount: imagePaths.length
      });
    } catch (error) {
      console.error('CBZ packaging error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
});

// GET /api/downloads/:id/metadata - Read ComicInfo.xml from packaged CBZ
router.get('/:id/metadata', (req, res) => {
  const downloadId = req.params.id;

  db.get('SELECT file_path FROM downloads WHERE id = ?', [downloadId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row || !row.file_path) {
      return res.status(404).json({ error: 'Download not packaged yet' });
    }

    try {
      const { readCbzMeta } = require('../services/cbz');
      const meta = readCbzMeta(row.file_path);
      if (!meta) {
        return res.status(404).json({ error: 'No ComicInfo.xml found in CBZ' });
      }
      res.json({ metadata: meta });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

function safeJsonParse(str) {
  try {
    return JSON.parse(str || '[]');
  } catch {
    return [];
  }
}

module.exports = router;
