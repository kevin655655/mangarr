const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db/database');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Downloads ComicInfo Integration', () => {
  let tmpDir;
  let mangaId;

  beforeAll(async () => {
    // Ensure the database has finished initialization before touching tables.
    // This avoids a race on CI where the slower filesystem can make the
    // `CREATE TABLE IF NOT EXISTS` callback run after beforeAll fires.
    if (db.waitForInit) {
      await db.waitForInit();
    }
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mangarr-dl-test-'));
    // Insert a test manga into library
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO library (mangabaka_id, title, description, authors, artists, genres, publisher, content_rating, original_language, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['test-manga-1', 'Test Manga', 'A test manga.', '["Author A"]', '["Artist B"]', '["Action"]', 'PubCo', 'safe', 'ja', 8.5],
        function(err) {
          if (err) return reject(err);
          mangaId = this.lastID;
          resolve();
        }
      );
    });
  }, 15000);

  afterAll(async () => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    if (mangaId) {
      await new Promise((resolve) => {
        db.run('DELETE FROM downloads WHERE manga_id = ?', [mangaId], () => {
          db.run('DELETE FROM library WHERE id = ?', [mangaId], resolve);
        });
      });
    }
  });

  test('POST /api/downloads queues a download', async () => {
    const res = await request(app)
      .post('/api/downloads')
      .send({ manga_id: mangaId, chapter_number: 1, chapter_title: 'Ch 1' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  test('POST /api/downloads/:id/package creates CBZ with ComicInfo.xml', async () => {
    // Create dummy images
    const img1 = path.join(tmpDir, 'page1.jpg');
    const img2 = path.join(tmpDir, 'page2.jpg');
    fs.writeFileSync(img1, Buffer.from('fake-image-1'));
    fs.writeFileSync(img2, Buffer.from('fake-image-2'));

    // Queue download first
    const queueRes = await request(app)
      .post('/api/downloads')
      .send({ manga_id: mangaId, chapter_number: 2, chapter_title: 'Ch 2' });
    const downloadId = queueRes.body.id;

    const cbzPath = path.join(tmpDir, 'chapter2.cbz');
    const res = await request(app)
      .post(`/api/downloads/${downloadId}/package`)
      .send({ imagePaths: [img1, img2], outputPath: cbzPath });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('CBZ created with ComicInfo.xml');
    expect(res.body.pageCount).toBe(2);
    expect(fs.existsSync(res.body.filePath)).toBe(true);
  });

  test('GET /api/downloads/:id/metadata reads ComicInfo.xml', async () => {
    const img = path.join(tmpDir, 'page.jpg');
    fs.writeFileSync(img, Buffer.from('x'));

    const queueRes = await request(app)
      .post('/api/downloads')
      .send({ manga_id: mangaId, chapter_number: 3, chapter_title: 'Ch 3' });
    const downloadId = queueRes.body.id;

    const cbzPath = path.join(tmpDir, 'chapter3.cbz');
    await request(app)
      .post(`/api/downloads/${downloadId}/package`)
      .send({ imagePaths: [img], outputPath: cbzPath });

    const res = await request(app)
      .get(`/api/downloads/${downloadId}/metadata`);

    expect(res.status).toBe(200);
    expect(res.body.metadata).toBeDefined();
    expect(res.body.metadata.series).toBe('Test Manga');
    expect(res.body.metadata.number).toBe(3);
    expect(res.body.metadata.pageCount).toBe(1);
  });
});
