const express = require('express');
const router = express.Router();
const db = require('../db/database');

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

// POST /api/downloads - Queue a download (stubbed)
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

module.exports = router;
