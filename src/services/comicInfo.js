/**
 * ComicInfo.xml parser and generator
 * Supports the ComicInfo.xml standard used by Kavita, Komga, Calibre, etc.
 * Handles both v1 and v2 schemas.
 *
 * Standard fields:
 *   Title, Series, Number, Volume, Summary, Writer, Penciller, Inker,
 *   Colorist, Letterer, CoverArtist, Editor, Publisher, Genre, Web,
 *   PageCount, Language, Format, BlackAndWhite, Manga, Characters,
 *   Teams, Locations, ScanInformation, StoryArc, SeriesGroup,
 *   AgeRating, CommunityRating, Review
 */

const { XMLParser, XMLBuilder } = require('fast-xml-parser');

// ---------------------------------------------------------------------------
// Default ComicInfo.xml template (v2.1 schema)
// ---------------------------------------------------------------------------

const DEFAULT_COMIC_INFO = {
  '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
  ComicInfo: {
    '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    '@_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
    Title: '',
    Series: '',
    Number: '',
    Volume: '',
    Summary: '',
    Writer: '',
    Penciller: '',
    Inker: '',
    Colorist: '',
    Letterer: '',
    CoverArtist: '',
    Editor: '',
    Publisher: '',
    Genre: '',
    Web: '',
    PageCount: '0',
    LanguageISO: '',
    Format: '',
    BlackAndWhite: 'Unknown',
    Manga: 'YesAndRightToLeft',
    Characters: '',
    Teams: '',
    Locations: '',
    ScanInformation: '',
    StoryArc: '',
    SeriesGroup: '',
    AgeRating: 'Unknown',
    CommunityRating: '',
    Review: ''
  }
};

// ---------------------------------------------------------------------------
// Mangarr → ComicInfo field mapping
// ---------------------------------------------------------------------------

/**
 * Map Mangarr metadata to ComicInfo.xml fields.
 *
 * @param {Object} manga      – normalized manga object from Mangabaka/MangaDex
 * @param {Object} chapter    – chapter-specific metadata
 * @param {Object} options    – extra overrides (pageCount, scanInfo, etc.)
 * @returns {Object}          – ComicInfo XML object ready for serialization
 */
function mapMangaToComicInfo(manga, chapter = {}, options = {}) {
  const info = structuredClone ? structuredClone(DEFAULT_COMIC_INFO) : JSON.parse(JSON.stringify(DEFAULT_COMIC_INFO));
  const ci = info.ComicInfo;

  // Series-level fields
  ci.Series = manga.title || '';
  ci.Title = chapter.title || manga.title || '';
  ci.Number = chapter.number != null ? String(chapter.number) : '';
  ci.Volume = chapter.volume != null ? String(chapter.volume) : (manga.volumesCount ? String(manga.volumesCount) : '');
  ci.Summary = manga.description || '';
  ci.Writer = joinList(manga.authors);
  ci.Penciller = joinList(manga.artists);
  ci.CoverArtist = joinList(manga.artists);
  ci.Publisher = manga.publisher || '';
  ci.Genre = joinList(manga.genres);
  ci.Web = manga.externalLinks?.official || manga.officialWebsite || '';
  ci.LanguageISO = languageToISO(manga.originalLanguage);
  ci.PageCount = String(options.pageCount || 0);
  ci.ScanInformation = options.scanInfo || '';
  ci.StoryArc = joinList(manga.relatedManga?.map(r => r.title));
  ci.SeriesGroup = joinList(manga.sameAuthorWorks?.map(w => w.title));
  ci.AgeRating = mapContentRating(manga.contentRating);
  ci.CommunityRating = manga.rating != null ? String(manga.rating) : '';
  ci.Manga = 'YesAndRightToLeft';
  ci.BlackAndWhite = 'Unknown';

  // Optional v2 fields
  if (manga.magazine) ci.Editor = manga.magazine;
  if (manga.demographic) ci.Teams = manga.demographic;

  return info;
}

// ---------------------------------------------------------------------------
// ComicInfo → Mangarr field mapping (for import / round-trip)
// ---------------------------------------------------------------------------

/**
 * Parse a ComicInfo.xml string into a normalized metadata object.
 *
 * @param {string} xmlString
 * @returns {Object}  – { series, title, number, volume, summary, writer,
 *                        penciller, coverArtist, publisher, genre, web,
 *                        pageCount, language, format, blackAndWhite, manga,
 *                        characters, teams, locations, scanInformation,
 *                        storyArc, seriesGroup, ageRating, communityRating,
 *                        review, raw }
 */
function parseComicInfo(xmlString) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: false,
    trimValues: true
  });

  const parsed = parser.parse(xmlString);

  // fast-xml-parser wraps unknown tags under the key name; reject if no ComicInfo key
  if (!parsed.ComicInfo && !parsed.comicInfo) {
    throw new Error('Invalid ComicInfo.xml: missing <ComicInfo> root element');
  }

  const ci = parsed.ComicInfo || parsed.comicInfo;

  const get = (key) => {
    const val = ci[key];
    return val !== undefined && val !== null ? String(val).trim() : '';
  };

  return {
    series: get('Series'),
    title: get('Title'),
    number: parseNumber(get('Number')),
    volume: parseNumber(get('Volume')),
    summary: get('Summary'),
    writer: splitList(get('Writer')),
    penciller: splitList(get('Penciller')),
    inker: splitList(get('Inker')),
    colorist: splitList(get('Colorist')),
    letterer: splitList(get('Letterer')),
    coverArtist: splitList(get('CoverArtist')),
    editor: splitList(get('Editor')),
    publisher: get('Publisher'),
    genre: splitList(get('Genre')),
    web: get('Web'),
    pageCount: parseInt(get('PageCount'), 10) || 0,
    language: isoToLanguage(get('LanguageISO')),
    format: get('Format'),
    blackAndWhite: get('BlackAndWhite'),
    manga: get('Manga'),
    characters: splitList(get('Characters')),
    teams: splitList(get('Teams')),
    locations: splitList(get('Locations')),
    scanInformation: get('ScanInformation'),
    storyArc: splitList(get('StoryArc')),
    seriesGroup: splitList(get('SeriesGroup')),
    ageRating: get('AgeRating'),
    communityRating: parseFloat(get('CommunityRating')) || null,
    review: get('Review'),
    raw: ci
  };
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Build a ComicInfo.xml string from a metadata object.
 *
 * @param {Object} info  – object returned by mapMangaToComicInfo() or parseComicInfo()
 * @returns {string}     – XML string
 */
function buildComicInfoXml(info) {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
    indentBy: '  ',
    suppressEmptyNode: true
  });

  // If info is already in the raw XML-object shape, use it directly;
  // otherwise wrap it back into the expected structure.
  let xmlObj;
  if (info['?xml'] && info.ComicInfo) {
    xmlObj = info;
  } else if (info.raw) {
    xmlObj = { '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' }, ComicInfo: info.raw };
  } else {
    xmlObj = mapMangaToComicInfo(info);
  }

  return builder.build(xmlObj);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function joinList(arr) {
  if (!Array.isArray(arr)) return arr || '';
  return arr.filter(Boolean).join(', ');
}

function splitList(str) {
  if (!str) return [];
  return str.split(/,\s*/).map(s => s.trim()).filter(Boolean);
}

function parseNumber(val) {
  if (!val) return null;
  const n = parseFloat(val);
  return Number.isNaN(n) ? null : n;
}

function languageToISO(lang) {
  const map = {
    ja: 'ja',
    japanese: 'ja',
    en: 'en',
    english: 'en',
    ko: 'ko',
    korean: 'ko',
    zh: 'zh',
    chinese: 'zh',
    fr: 'fr',
    french: 'fr',
    de: 'de',
    german: 'de',
    es: 'es',
    spanish: 'es',
    it: 'it',
    italian: 'it',
    pt: 'pt',
    portuguese: 'pt',
    ru: 'ru',
    russian: 'ru'
  };
  return map[(lang || '').toLowerCase()] || '';
}

function isoToLanguage(iso) {
  const map = {
    ja: 'Japanese',
    en: 'English',
    ko: 'Korean',
    zh: 'Chinese',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian'
  };
  return map[iso] || iso;
}

function mapContentRating(rating) {
  const map = {
    safe: 'Everyone',
    suggestive: 'Teen',
    erotica: 'Mature',
    pornographic: 'Adults Only 18+',
    unknown: 'Unknown'
  };
  return map[(rating || '').toLowerCase()] || 'Unknown';
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  mapMangaToComicInfo,
  parseComicInfo,
  buildComicInfoXml,
  DEFAULT_COMIC_INFO,
  // Re-export helpers for tests
  joinList,
  splitList,
  languageToISO,
  isoToLanguage,
  mapContentRating
};
