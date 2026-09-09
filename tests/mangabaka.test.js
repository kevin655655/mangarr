// Mock axios so the integration tests are deterministic and don't depend
// on the live Mangabaka API. `mangabaka.js` calls `axios.create(...)` at
// module load time to capture the `http` client, so the mocked `create`
// must return a stable object whose `.get` we can swap per-test.
jest.mock('axios', () => {
  const get = jest.fn();
  return {
    __mockGet: get,
    create: jest.fn(() => ({ get }))
  };
});

const axios = require('axios');
const { searchManga, getMangaDetails, normalizeManga } = require('../src/services/mangabaka');

describe('Mangabaka Service', () => {
  beforeEach(() => {
    axios.__mockGet.mockReset();
  });

  test('normalizeManga handles various API formats', () => {
    const raw = {
      id: 'test-1',
      title: 'Test Manga',
      cover: {
        x350: { x1: 'https://example.com/cover.jpg' }
      },
      status: 'ongoing',
      total_chapters: '1'
    };
    const normalized = normalizeManga(raw);
    expect(normalized.id).toBe('test-1');
    expect(normalized.coverUrl).toBe('https://example.com/cover.jpg');
    expect(normalized.chaptersCount).toBe(1);
  });

  test('searchManga returns normalized manga on success', async () => {
    const fakePayload = {
      data: [
        {
          id: 'naruto',
          title: 'Naruto',
          cover: { x350: { x1: 'https://example.com/naruto.jpg' } },
          status: 'ongoing',
          total_chapters: '700'
        }
      ]
    };
    axios.__mockGet.mockResolvedValueOnce({ data: fakePayload });

    const results = await searchManga('naruto');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('naruto');
    expect(results[0].title).toBe('Naruto');
    expect(results[0].coverUrl).toBe('https://example.com/naruto.jpg');
    expect(results[0].chaptersCount).toBe(700);
    expect(axios.__mockGet).toHaveBeenCalledTimes(1);
  });

  test('searchManga rejects on upstream failure', async () => {
    axios.__mockGet.mockRejectedValueOnce(new Error('ECONNRESET'));

    await expect(searchManga('naruto')).rejects.toThrow('ECONNRESET');
    expect(axios.__mockGet).toHaveBeenCalledTimes(1);
  });

  test('getMangaDetails returns normalized manga on success', async () => {
    const fakePayload = {
      data: {
        id: 'test-id',
        title: 'Test Manga',
        cover: { x350: { x1: 'https://example.com/test.jpg' } },
        status: 'ongoing',
        total_chapters: '42'
      }
    };
    axios.__mockGet.mockResolvedValueOnce({ data: fakePayload });

    const manga = await getMangaDetails('test-id');
    expect(manga).toHaveProperty('id', 'test-id');
    expect(manga).toHaveProperty('title', 'Test Manga');
    expect(manga).toHaveProperty('coverUrl', 'https://example.com/test.jpg');
    expect(manga).toHaveProperty('chaptersCount', 42);
    expect(axios.__mockGet).toHaveBeenCalledTimes(1);
  });

  test('getMangaDetails rejects on upstream failure', async () => {
    axios.__mockGet.mockRejectedValueOnce(new Error('ECONNRESET'));

    await expect(getMangaDetails('test-id')).rejects.toThrow('ECONNRESET');
    expect(axios.__mockGet).toHaveBeenCalledTimes(1);
  });
});
