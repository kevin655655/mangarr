const express = require('express');
const router = express.Router();
const db = require('../db/database');

function getDefaultSettings() {
  return {
    sources: {
      mangabakaUrl: 'https://api.mangabaka.org',
      mangadexUrl: 'https://api.mangadex.org',
      additionalSources: [],
      sourcePriority: ['mangabaka', 'mangadex'],
      proxyType: 'none',
      proxyHost: '',
      proxyPort: '',
      proxyUsername: '',
      proxyPassword: '',
      timeoutMs: 30000
    },
    downloads: {
      defaultFormat: 'cbz',
      concurrentDownloads: 3,
      concurrentConnections: 4,
      downloadDirectory: '',
      autoDownloadNew: false,
      deleteAfterRead: false,
      imageQuality: 'original'
    },
    reader: {
      readingDirection: 'rtl',
      pageFitMode: 'fit-width',
      backgroundColor: 'black',
      customBackgroundColor: '#000000',
      showPageNumbers: true,
      preloadPages: 3,
      doublePageSpreads: 'auto'
    },
    library: {
      autoUpdateInterval: 'daily',
      notificationPreference: 'browser',
      metadataLanguage: 'english',
      defaultContentFilter: 'hide-adult',
      importDirectories: [],
      exportFormat: 'json'
    },
    ui: {
      theme: 'dark',
      language: 'en',
      itemsPerPage: 'normal',
      coverSize: 'medium',
      showNsfwCovers: 'blur'
    },
    advanced: {
      debugMode: false,
      apiKeys: {}
    }
  };
}

// GET /api/settings - Get all settings
router.get('/', (req, res) => {
  db.get('SELECT sources, downloads, reader, library, ui, advanced FROM settings WHERE id = 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      // Return defaults if no row exists
      const defaults = getDefaultSettings();
      return res.json({ settings: defaults });
    }
    try {
      const settings = {
        sources: JSON.parse(row.sources || '{}'),
        downloads: JSON.parse(row.downloads || '{}'),
        reader: JSON.parse(row.reader || '{}'),
        library: JSON.parse(row.library || '{}'),
        ui: JSON.parse(row.ui || '{}'),
        advanced: JSON.parse(row.advanced || '{}')
      };
      res.json({ settings });
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse settings: ' + parseErr.message });
    }
  });
});

// GET /api/settings/export - Export all settings as JSON
router.get('/export', (req, res) => {
  db.get('SELECT sources, downloads, reader, library, ui, advanced FROM settings WHERE id = 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const defaults = getDefaultSettings();
    let settings = defaults;
    if (row) {
      try {
        settings = {
          sources: JSON.parse(row.sources || '{}'),
          downloads: JSON.parse(row.downloads || '{}'),
          reader: JSON.parse(row.reader || '{}'),
          library: JSON.parse(row.library || '{}'),
          ui: JSON.parse(row.ui || '{}'),
          advanced: JSON.parse(row.advanced || '{}')
        };
      } catch (e) {
        settings = defaults;
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="mangarr-settings.json"');
    res.json({ version: '0.1.0', exportedAt: new Date().toISOString(), settings });
  });
});

// GET /api/settings/:category - Get settings for a specific category
router.get('/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['sources', 'downloads', 'reader', 'library', 'ui', 'advanced'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  db.get(`SELECT ${category} FROM settings WHERE id = 1`, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      const defaults = getDefaultSettings();
      return res.json({ [category]: defaults[category] });
    }
    try {
      res.json({ [category]: JSON.parse(row[category] || '{}') });
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse settings: ' + parseErr.message });
    }
  });
});

// PUT /api/settings - Update all settings
router.put('/', (req, res) => {
  const { sources, downloads, reader, library, ui, advanced } = req.body;
  const defaults = getDefaultSettings();

  const newSettings = {
    sources: sources !== undefined ? { ...defaults.sources, ...sources } : defaults.sources,
    downloads: downloads !== undefined ? { ...defaults.downloads, ...downloads } : defaults.downloads,
    reader: reader !== undefined ? { ...defaults.reader, ...reader } : defaults.reader,
    library: library !== undefined ? { ...defaults.library, ...library } : defaults.library,
    ui: ui !== undefined ? { ...defaults.ui, ...ui } : defaults.ui,
    advanced: advanced !== undefined ? { ...defaults.advanced, ...advanced } : defaults.advanced
  };

  db.run(
    `INSERT INTO settings (id, sources, downloads, reader, library, ui, advanced, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       sources = excluded.sources,
       downloads = excluded.downloads,
       reader = excluded.reader,
       library = excluded.library,
       ui = excluded.ui,
       advanced = excluded.advanced,
       updated_at = excluded.updated_at`,
    [
      JSON.stringify(newSettings.sources),
      JSON.stringify(newSettings.downloads),
      JSON.stringify(newSettings.reader),
      JSON.stringify(newSettings.library),
      JSON.stringify(newSettings.ui),
      JSON.stringify(newSettings.advanced)
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ settings: newSettings, message: 'Settings updated successfully' });
    }
  );
});

// PATCH /api/settings/:category - Update a specific category
router.patch('/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['sources', 'downloads', 'reader', 'library', 'ui', 'advanced'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  db.get(`SELECT ${category} FROM settings WHERE id = 1`, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const defaults = getDefaultSettings();
    let current = defaults[category];
    if (row && row[category]) {
      try {
        current = JSON.parse(row[category]);
      } catch (e) {
        current = defaults[category];
      }
    }

    const merged = { ...current, ...req.body };

    db.run(
      `UPDATE settings SET ${category} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [JSON.stringify(merged)],
      function(err2) {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        res.json({ [category]: merged, message: `${category} settings updated` });
      }
    );
  });
});

// POST /api/settings/reset - Reset all settings to defaults
router.post('/reset', (req, res) => {
  const { category } = req.body || {};
  const defaults = getDefaultSettings();

  if (category) {
    const validCategories = ['sources', 'downloads', 'reader', 'library', 'ui', 'advanced'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }

    db.run(
      `UPDATE settings SET ${category} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [JSON.stringify(defaults[category])],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ [category]: defaults[category], message: `${category} settings reset to defaults` });
      }
    );
  } else {
    db.run(
      `UPDATE settings SET
        sources = ?, downloads = ?, reader = ?, library = ?, ui = ?, advanced = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [
        JSON.stringify(defaults.sources),
        JSON.stringify(defaults.downloads),
        JSON.stringify(defaults.reader),
        JSON.stringify(defaults.library),
        JSON.stringify(defaults.ui),
        JSON.stringify(defaults.advanced)
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ settings: defaults, message: 'All settings reset to defaults' });
      }
    );
  }
});



// POST /api/settings/import - Import settings from JSON
router.post('/import', (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }

  const defaults = getDefaultSettings();
  const validCategories = ['sources', 'downloads', 'reader', 'library', 'ui', 'advanced'];
  const merged = {};

  for (const cat of validCategories) {
    merged[cat] = settings[cat] !== undefined
      ? { ...defaults[cat], ...settings[cat] }
      : defaults[cat];
  }

  db.run(
    `INSERT INTO settings (id, sources, downloads, reader, library, ui, advanced, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       sources = excluded.sources,
       downloads = excluded.downloads,
       reader = excluded.reader,
       library = excluded.library,
       ui = excluded.ui,
       advanced = excluded.advanced,
       updated_at = excluded.updated_at`,
    [
      JSON.stringify(merged.sources),
      JSON.stringify(merged.downloads),
      JSON.stringify(merged.reader),
      JSON.stringify(merged.library),
      JSON.stringify(merged.ui),
      JSON.stringify(merged.advanced)
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ settings: merged, message: 'Settings imported successfully' });
    }
  );
});

module.exports = router;
