const request = require('supertest');
const app = require('../src/server');
const db = require('../src/db/database');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Library ComicInfo Import', () => {
  let tmpDir;
  let cbzPath;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mangarr-lib-test-'));
    cbzPath = path.join(tmpDir, 'sample.cbz');

    // Create a CBZ with ComicInfo.xml via the service
    const { createCbz } = require('../src/services/cbz');
    const img = path.join(tmpDir, 'page.jpg');
    fs.writeFileSync(img, Buffer.from('fake-image'));

    createCbz([img], cbzPath, {
      manga: {
        title: 'Imported Manga',
        description: 'From CBZ.',
        authors: ['Writer X'],
        artists: ['Artist Y'],
        genres: ['Fantasy'],
        publisher: 'Import Pub',
        contentRating: 'safe',
        originalLanguage: 'en',
        rating: 9.0,
        volumesCount: 1,
        externalLinks: { official: 'https://import.example.com' },
        relatedManga: [],
        sameAuthorWorks: [],
        magazine: ''
      },
      chapter: { title: 'Ch 1', number: 1, volume: 1 }
    });
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('POST /api/library/import-cbz extracts ComicInfo metadata', async () => {
    const res = await request(app)
      .post('/api/library/import-cbz')
      .send({ filePath: cbzPath });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('CBZ metadata imported');
    expect(res.body.manga.title).toBe('Imported Manga');
    expect(res.body.manga.authors).toEqual(['Writer X']);
    expect(res.body.manga.genres).toEqual(['Fantasy']);
    expect(res.body.chapter.number).toBe(1);
    expect(res.body.comicInfo.series).toBe('Imported Manga');
  });

  test('POST /api/library/import-cbz returns 404 for missing file', async () => {
    const res = await request(app)
      .post('/api/library/import-cbz')
      .send({ filePath: '/nonexistent/file.cbz' });

    expect(res.status).toBe(404);
  });

  test('POST /api/library/:id/refresh-metadata updates library from CBZ', async () => {
    // Insert a manga first
    const insertRes = await request(app)
      .post('/api/library')
      .send({
        mangabaka_id: 'refresh-test-1',
        title: 'Old Title',
        description: 'Old desc.',
        authors: ['Old Author'],
        genres: ['Old Genre'],
        publisher: 'Old Pub'
      });

    const mangaId = insertRes.body.id;

    const res = await request(app)
      .post(`/api/library/${mangaId}/refresh-metadata`)
      .send({ filePath: cbzPath });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Metadata refreshed from CBZ ComicInfo.xml');

    // Verify update
    const getRes = await request(app).get('/api/library');
    const updated = getRes.body.library.find(m => m.id === mangaId);
    expect(updated.title).toBe('Imported Manga');
    expect(updated.authors).toBe('["Writer X"]');
    expect(updated.genres).toBe('["Fantasy"]');
    expect(updated.publisher).toBe('Import Pub');

    // Cleanup
    await request(app).delete(`/api/library/${mangaId}`);
  });
});
