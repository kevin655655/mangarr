const {
  mapMangaToComicInfo,
  parseComicInfo,
  buildComicInfoXml,
  joinList,
  splitList,
  languageToISO,
  isoToLanguage,
  mapContentRating
} = require('../src/services/comicInfo');

describe('ComicInfo Service', () => {
  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  describe('helpers', () => {
    test('joinList joins arrays with comma+space', () => {
      expect(joinList(['A', 'B', 'C'])).toBe('A, B, C');
      expect(joinList([])).toBe('');
      expect(joinList(null)).toBe('');
    });

    test('splitList splits comma-separated string', () => {
      expect(splitList('A, B, C')).toEqual(['A', 'B', 'C']);
      expect(splitList('')).toEqual([]);
      expect(splitList(null)).toEqual([]);
    });

    test('languageToISO maps correctly', () => {
      expect(languageToISO('ja')).toBe('ja');
      expect(languageToISO('Japanese')).toBe('ja');
      expect(languageToISO('en')).toBe('en');
      expect(languageToISO('unknown')).toBe('');
    });

    test('isoToLanguage maps correctly', () => {
      expect(isoToLanguage('ja')).toBe('Japanese');
      expect(isoToLanguage('en')).toBe('English');
      expect(isoToLanguage('xx')).toBe('xx');
    });

    test('mapContentRating maps Mangarr ratings to ComicInfo age ratings', () => {
      expect(mapContentRating('safe')).toBe('Everyone');
      expect(mapContentRating('suggestive')).toBe('Teen');
      expect(mapContentRating('erotica')).toBe('Mature');
      expect(mapContentRating('pornographic')).toBe('Adults Only 18+');
      expect(mapContentRating('unknown')).toBe('Unknown');
    });
  });

  // -------------------------------------------------------------------------
  // mapMangaToComicInfo
  // -------------------------------------------------------------------------
  describe('mapMangaToComicInfo', () => {
    const sampleManga = {
      title: 'Test Manga',
      description: 'A test manga.',
      authors: ['Writer One', 'Writer Two'],
      artists: ['Artist One'],
      genres: ['Action', 'Fantasy'],
      publisher: 'Test Publisher',
      contentRating: 'safe',
      originalLanguage: 'ja',
      rating: 8.5,
      volumesCount: 3,
      externalLinks: { official: 'https://example.com' },
      relatedManga: [{ title: 'Spin-off' }],
      sameAuthorWorks: [{ title: 'Other Work' }],
      magazine: 'Weekly Test'
    };

    test('maps basic fields correctly', () => {
      const info = mapMangaToComicInfo(sampleManga);
      const ci = info.ComicInfo;

      expect(ci.Series).toBe('Test Manga');
      expect(ci.Summary).toBe('A test manga.');
      expect(ci.Writer).toBe('Writer One, Writer Two');
      expect(ci.Penciller).toBe('Artist One');
      expect(ci.CoverArtist).toBe('Artist One');
      expect(ci.Publisher).toBe('Test Publisher');
      expect(ci.Genre).toBe('Action, Fantasy');
      expect(ci.Web).toBe('https://example.com');
      expect(ci.LanguageISO).toBe('ja');
      expect(ci.AgeRating).toBe('Everyone');
      expect(ci.CommunityRating).toBe('8.5');
      expect(ci.Manga).toBe('YesAndRightToLeft');
    });

    test('maps chapter fields', () => {
      const chapter = { title: 'Chapter 5: The Test', number: 5, volume: 1 };
      const info = mapMangaToComicInfo(sampleManga, chapter);
      const ci = info.ComicInfo;

      expect(ci.Title).toBe('Chapter 5: The Test');
      expect(ci.Number).toBe('5');
      expect(ci.Volume).toBe('1');
    });

    test('falls back to manga title when chapter title missing', () => {
      const info = mapMangaToComicInfo(sampleManga, {});
      expect(info.ComicInfo.Title).toBe('Test Manga');
    });

    test('sets page count from options', () => {
      const info = mapMangaToComicInfo(sampleManga, {}, { pageCount: 24 });
      expect(info.ComicInfo.PageCount).toBe('24');
    });

    test('maps magazine to Editor field', () => {
      const info = mapMangaToComicInfo(sampleManga);
      expect(info.ComicInfo.Editor).toBe('Weekly Test');
    });
  });

  // -------------------------------------------------------------------------
  // parseComicInfo + buildComicInfoXml round-trip
  // -------------------------------------------------------------------------
  describe('round-trip', () => {
    test('parse → build → parse preserves data', () => {
      const manga = {
        title: 'Round-trip Manga',
        description: 'Testing round-trip.',
        authors: ['Author A'],
        artists: ['Artist B'],
        genres: ['Sci-Fi'],
        publisher: 'PubCo',
        contentRating: 'suggestive',
        originalLanguage: 'en',
        rating: 7.2,
        volumesCount: 2
      };
      const chapter = { title: 'Ch 1', number: 1, volume: 1 };

      const infoObj = mapMangaToComicInfo(manga, chapter, { pageCount: 32 });
      const xml = buildComicInfoXml(infoObj);

      // XML must contain expected elements
      expect(xml).toContain('<ComicInfo');
      expect(xml).toContain('<Series>Round-trip Manga</Series>');
      expect(xml).toContain('<Number>1</Number>');
      expect(xml).toContain('<PageCount>32</PageCount>');
      expect(xml).toContain('<Manga>YesAndRightToLeft</Manga>');

      const parsed = parseComicInfo(xml);

      expect(parsed.series).toBe('Round-trip Manga');
      expect(parsed.title).toBe('Ch 1');
      expect(parsed.number).toBe(1);
      expect(parsed.volume).toBe(1);
      expect(parsed.summary).toBe('Testing round-trip.');
      expect(parsed.writer).toEqual(['Author A']);
      expect(parsed.penciller).toEqual(['Artist B']);
      expect(parsed.genre).toEqual(['Sci-Fi']);
      expect(parsed.publisher).toBe('PubCo');
      expect(parsed.ageRating).toBe('Teen');
      expect(parsed.language).toBe('English');
      expect(parsed.communityRating).toBe(7.2);
      expect(parsed.pageCount).toBe(32);
    });

    test('parse handles empty or minimal XML', () => {
      const xml = `<?xml version="1.0"?>
        <ComicInfo>
          <Series>Minimal</Series>
        </ComicInfo>`;
      const parsed = parseComicInfo(xml);
      expect(parsed.series).toBe('Minimal');
      expect(parsed.title).toBe('');
      expect(parsed.pageCount).toBe(0);
    });

    test('parse throws on invalid XML', () => {
      expect(() => parseComicInfo('<not-comic-info/>')).toThrow();
    });
  });
});
