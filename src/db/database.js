const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/mangarr.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let initState = 'pending'; // 'pending' | 'initialized'
const initWaiters = [];

function markInitialized() {
  if (initState === 'initialized') return;
  initState = 'initialized';
  const waiters = initWaiters.splice(0);
  for (const resolve of waiters) resolve();
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    markInitialized();
  } else {
    console.log('Connected to SQLite database.');
    initTables();
  }
});

// Make db serial queue of CREATE TABLE calls.
db.serialize(() => {
  // Implemented below in initTables via plain .run() calls; sqlite3's
  // default behaviour already serializes per-connection calls.
});

function initTables() {
  // Run all CREATE TABLE statements in a serialize block so they are
  // guaranteed to execute before the settings INSERT (and before any
  // external code can touch the tables).
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mangabaka_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        alt_titles TEXT,
        description TEXT,
        cover_url TEXT,
        status TEXT,
        year INTEGER,
        authors TEXT,
        artists TEXT,
        genres TEXT,
        chapters_count INTEGER DEFAULT 0,
        volumes_count INTEGER DEFAULT 0,
        content_rating TEXT,
        demographic TEXT,
        original_language TEXT,
        publisher TEXT,
        magazine TEXT,
        rating REAL,
        follows_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        last_updated TEXT,
        anilist_id TEXT,
        mal_id TEXT,
        official_website TEXT,
        raw_source_url TEXT,
        english_license_url TEXT,
        related_manga TEXT,
        recommendations TEXT,
        same_author_works TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manga_id INTEGER NOT NULL,
        chapter_number REAL,
        chapter_title TEXT,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manga_id) REFERENCES library(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sources TEXT DEFAULT '{}',
        downloads TEXT DEFAULT '{}',
        reader TEXT DEFAULT '{}',
        library TEXT DEFAULT '{}',
        ui TEXT DEFAULT '{}',
        advanced TEXT DEFAULT '{}',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, [], function(err) {
      if (err) {
        console.error('Error creating settings table:', err.message);
        markInitialized();
        return;
      }
      // Insert default settings row if none exists (only after tables exist).
      db.get('SELECT id FROM settings WHERE id = 1', [], (err, row) => {
        if (!err && !row) {
          const defaults = getDefaultSettings();
          db.run(
            `INSERT INTO settings (id, sources, downloads, reader, library, ui, advanced) VALUES (1, ?, ?, ?, ?, ?, ?)`,
            [
              JSON.stringify(defaults.sources),
              JSON.stringify(defaults.downloads),
              JSON.stringify(defaults.reader),
              JSON.stringify(defaults.library),
              JSON.stringify(defaults.ui),
              JSON.stringify(defaults.advanced)
            ],
            () => markInitialized()
          );
        } else {
          markInitialized();
        }
      });
    });
  });
}

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

/**
 * Wait for the database to finish initializing (all tables created,
 * default settings row inserted). Resolves immediately on subsequent
 * calls.
 */
function waitForInit() {
  if (initState === 'initialized') return Promise.resolve();
  return new Promise((resolve) => {
    initWaiters.push(resolve);
    // Safety net so waiters are never stranded if the connection callback
    // never fires (e.g. open error swallowed).
    setTimeout(() => {
      if (initState !== 'initialized') markInitialized();
    }, 2000);
  });
}

module.exports.getDefaultSettings = getDefaultSettings;
module.exports.waitForInit = waitForInit;

module.exports = db;
