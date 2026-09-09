const { searchManga, getMangaDetails, normalizeManga } = require('../src/services/mangabaka');

describe('Mangabaka Service', () => {
  test('normalizeManga handles various API formats', () => {
    const raw = {
      id: 'test-1',
      title: 'Test Manga',
      cover_url: 'https://example.com/cover.jpg',
      status: 'ongoing',
      chapters: [{ number: 1 }]
    };
    const normalized = normalizeManga(raw);
    expect(normalized.id).toBe('test-1');
    expect(normalized.coverUrl).toBe('https://example.com/cover.jpg');
    expect(normalized.chaptersCount).toBe(1);
  });

  test('searchManga returns results or mock data', async () => {
    const results = await searchManga('naruto');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  test('getMangaDetails returns manga object', async () => {
    const manga = await getMangaDetails('test-id');
    expect(manga).toHaveProperty('id');
    expect(manga).toHaveProperty('title');
  });
});
