// Mock data for Mangarr prototype
// Seeded, deterministic. No emoji. Original series names to avoid brand issues.

const GROUPS = [
  "NullScan", "Twilight Scans", "Paperback Lanterns", "Ironkite",
  "Moonwell Translations", "Kuro Ink", "Harbor 17", "Verdigris Group",
  "Low Tide Press", "Rainfall Scans", "Halftone Collective", "Signal Flare"
];

const STATUSES = ["ongoing", "hiatus", "completed", "cancelled"];

const SERIES = [
  { t: "Chrysanthemum Clockwork",  a: "Hinata Orikasa",    y: 2019, s: "ongoing",   g: ["Seinen","Sci-Fi","Drama"],       ch: 142, have: 142, mon: true,  rt: 8.7, src: "MangaDex",   hue: 142 },
  { t: "The Paper Lanternmaker",    a: "Jun Watari",        y: 2021, s: "ongoing",   g: ["Slice of Life","Historical"],     ch: 68,  have: 65,  mon: true,  rt: 8.1, src: "MangaDex",   hue: 28  },
  { t: "Ironkite",                  a: "R. Saleh",          y: 2022, s: "ongoing",   g: ["Shonen","Action"],                ch: 52,  have: 52,  mon: true,  rt: 7.9, src: "MangaDex",   hue: 220 },
  { t: "Low Tide, High Tower",      a: "E. Park",           y: 2018, s: "completed", g: ["Romance","Drama"],                ch: 120, have: 120, mon: false, rt: 9.1, src: "Bato",       hue: 310 },
  { t: "Halftone Boys",             a: "M. Karashima",      y: 2023, s: "ongoing",   g: ["Comedy","School"],                ch: 36,  have: 32,  mon: true,  rt: 7.4, src: "MangaDex",   hue: 48  },
  { t: "Nightjar, After Midnight",  a: "V. Cordova",        y: 2020, s: "hiatus",    g: ["Mystery","Thriller"],             ch: 44,  have: 41,  mon: true,  rt: 8.3, src: "MangaDex",   hue: 264 },
  { t: "Verdigris & Brass",         a: "S. Amakusa",        y: 2017, s: "ongoing",   g: ["Fantasy","Adventure"],            ch: 201, have: 198, mon: true,  rt: 8.5, src: "MangaSee",   hue: 168 },
  { t: "Harbor Light 17",           a: "T. Okuda",          y: 2024, s: "ongoing",   g: ["Seinen","Sports"],                ch: 18,  have: 18,  mon: true,  rt: 7.6, src: "MangaDex",   hue: 200 },
  { t: "A Very Small Country",      a: "L. Ferreira",       y: 2016, s: "completed", g: ["Drama","Historical"],             ch: 88,  have: 88,  mon: false, rt: 9.3, src: "MangaDex",   hue: 12  },
  { t: "Kuro Ink Diaries",          a: "N. Shirayuki",      y: 2022, s: "ongoing",   g: ["Josei","Romance"],                ch: 58,  have: 54,  mon: true,  rt: 8.0, src: "Bato",       hue: 340 },
  { t: "Signal Flare",              a: "A. Qureshi",        y: 2021, s: "ongoing",   g: ["Sci-Fi","Military"],              ch: 74,  have: 71,  mon: true,  rt: 8.2, src: "MangaDex",   hue: 0   },
  { t: "Moonwell",                  a: "K. Aarvik",         y: 2015, s: "ongoing",   g: ["Fantasy","Horror"],               ch: 310, have: 308, mon: true,  rt: 8.8, src: "MangaDex",   hue: 250 },
  { t: "Rainfall on Concrete",      a: "P. Batista",        y: 2019, s: "cancelled", g: ["Slice of Life"],                  ch: 22,  have: 22,  mon: false, rt: 6.9, src: "MangaSee",   hue: 210 },
  { t: "Twilight Commuter",         a: "I. Fujiwara",       y: 2020, s: "ongoing",   g: ["Romance","Slice of Life"],        ch: 94,  have: 94,  mon: true,  rt: 8.4, src: "MangaDex",   hue: 300 },
  { t: "The Last Dispatch",         a: "G. Okafor",         y: 2023, s: "ongoing",   g: ["Thriller","Drama"],               ch: 24,  have: 21,  mon: true,  rt: 8.0, src: "MangaDex",   hue: 358 },
  { t: "Paperback Lanterns",        a: "Y. Mori",           y: 2018, s: "ongoing",   g: ["Fantasy","Drama"],                ch: 156, have: 156, mon: true,  rt: 8.6, src: "MangaDex",   hue: 36  },
  { t: "Third Shift",               a: "D. Asante",         y: 2024, s: "ongoing",   g: ["Supernatural","Thriller"],        ch: 11,  have: 10,  mon: true,  rt: 7.8, src: "MangaDex",   hue: 184 },
  { t: "Bluejacket",                a: "F. Lemaire",        y: 2017, s: "completed", g: ["Historical","Drama"],             ch: 104, have: 104, mon: false, rt: 9.0, src: "MangaDex",   hue: 228 },
  { t: "The Cartography Club",      a: "H. Nishimura",      y: 2022, s: "ongoing",   g: ["Adventure","Comedy"],             ch: 47,  have: 45,  mon: true,  rt: 7.7, src: "MangaDex",   hue: 160 },
  { t: "Salt, and a Window",        a: "M. Ibáñez",         y: 2020, s: "hiatus",    g: ["Drama","Romance"],                ch: 63,  have: 60,  mon: true,  rt: 8.2, src: "Bato",       hue: 24  },
  { t: "Ferrous Heart",             a: "C. Tanaka",         y: 2019, s: "ongoing",   g: ["Mecha","Sci-Fi"],                 ch: 128, have: 124, mon: true,  rt: 8.4, src: "MangaDex",   hue: 14  },
  { t: "Plum Season",               a: "A. Hayashi",        y: 2021, s: "ongoing",   g: ["Slice of Life","Food"],           ch: 41,  have: 41,  mon: true,  rt: 7.5, src: "MangaDex",   hue: 320 },
  { t: "The Quiet Rooms",           a: "B. Hollis",         y: 2016, s: "completed", g: ["Horror","Mystery"],               ch: 78,  have: 78,  mon: false, rt: 8.9, src: "MangaDex",   hue: 270 },
  { t: "North of Nowhere",          a: "J. Eriksen",        y: 2023, s: "ongoing",   g: ["Adventure","Drama"],              ch: 28,  have: 26,  mon: true,  rt: 7.9, src: "MangaSee",   hue: 196 },
];

// Wanted/missing — chapters that are marked monitored but not downloaded
const WANTED = [
  { series: "Chrysanthemum Clockwork", ch: "143", title: "The Seventh Gear Turns",            age: "2h 14m",  status: "searching" },
  { series: "The Paper Lanternmaker",   ch: "66",  title: "A Small Light, Before Dawn",        age: "6h 02m",  status: "queued"    },
  { series: "The Paper Lanternmaker",   ch: "67",  title: "Uncle Toshiro's Summer",             age: "6h 02m",  status: "queued"    },
  { series: "The Paper Lanternmaker",   ch: "68",  title: "The Lake Under the Lake",            age: "6h 02m",  status: "missing"   },
  { series: "Halftone Boys",            ch: "33",  title: "Cram School Riot",                   age: "1d 04h",  status: "missing"   },
  { series: "Halftone Boys",            ch: "34",  title: "How to Lose a Student Council Race", age: "1d 04h",  status: "missing"   },
  { series: "Halftone Boys",            ch: "35",  title: "Halftone Boys",                      age: "1d 04h",  status: "missing"   },
  { series: "Halftone Boys",            ch: "36",  title: "After the Final Bell",               age: "12h 19m", status: "missing"   },
  { series: "Nightjar, After Midnight", ch: "42",  title: "The Fifth Witness",                  age: "3d 10h",  status: "failed"    },
  { series: "Nightjar, After Midnight", ch: "43",  title: "A Quiet Confession",                 age: "3d 10h",  status: "missing"   },
  { series: "Nightjar, After Midnight", ch: "44",  title: "Verdict",                            age: "2d 00h",  status: "missing"   },
  { series: "Verdigris & Brass",        ch: "199", title: "The Brass Door",                     age: "4h 48m",  status: "searching" },
  { series: "Verdigris & Brass",        ch: "200", title: "Two Hundred Reasons",                age: "4h 48m",  status: "queued"    },
  { series: "Verdigris & Brass",        ch: "201", title: "Brass and Green",                    age: "4h 48m",  status: "missing"   },
  { series: "Kuro Ink Diaries",         ch: "55",  title: "The Calligrapher's Apprentice",      age: "8h 33m",  status: "missing"   },
  { series: "Kuro Ink Diaries",         ch: "56",  title: "Ink on Silk",                        age: "8h 33m",  status: "missing"   },
  { series: "Kuro Ink Diaries",         ch: "57",  title: "Red Seal",                           age: "8h 33m",  status: "missing"   },
  { series: "Kuro Ink Diaries",         ch: "58",  title: "A Letter, Unsigned",                 age: "5h 12m",  status: "searching" },
  { series: "Signal Flare",             ch: "72",  title: "Dark Frequencies",                   age: "10h 02m", status: "missing"   },
  { series: "Signal Flare",             ch: "73",  title: "The 4th Battalion",                  age: "10h 02m", status: "missing"   },
  { series: "Signal Flare",             ch: "74",  title: "Signal Lost",                        age: "3h 41m",  status: "queued"    },
  { series: "Moonwell",                 ch: "309", title: "Beneath the Hollow Oak",             age: "2d 14h",  status: "missing"   },
  { series: "Moonwell",                 ch: "310", title: "The Ninth Well",                     age: "1d 09h",  status: "missing"   },
  { series: "The Last Dispatch",        ch: "22",  title: "The Managing Editor",                age: "6d 00h",  status: "failed"    },
  { series: "The Last Dispatch",        ch: "23",  title: "Deadline",                           age: "2d 04h",  status: "missing"   },
  { series: "The Last Dispatch",        ch: "24",  title: "Final Edition",                      age: "18h 21m", status: "searching" },
  { series: "Third Shift",              ch: "11",  title: "Ghost Shift",                        age: "9h 09m",  status: "missing"   },
  { series: "The Cartography Club",     ch: "46",  title: "West of the Compass",                age: "1d 02h",  status: "missing"   },
  { series: "The Cartography Club",     ch: "47",  title: "An Unmapped Island",                 age: "14h 47m", status: "searching" },
  { series: "Ferrous Heart",            ch: "125", title: "Iron in the Blood",                  age: "11h 32m", status: "missing"   },
  { series: "Ferrous Heart",            ch: "126", title: "The Second Pilot",                   age: "11h 32m", status: "missing"   },
  { series: "Ferrous Heart",            ch: "127", title: "Atmospheric Re-Entry",               age: "11h 32m", status: "missing"   },
  { series: "Ferrous Heart",            ch: "128", title: "The Heart Is a Furnace",             age: "4h 20m",  status: "queued"    },
  { series: "Salt, and a Window",       ch: "61",  title: "Salt",                               age: "7d 00h",  status: "missing"   },
  { series: "Salt, and a Window",       ch: "62",  title: "A Window",                           age: "7d 00h",  status: "missing"   },
  { series: "Salt, and a Window",       ch: "63",  title: "The View From Here",                 age: "5d 16h",  status: "missing"   },
];

const HISTORY = [
  { when: "2m ago",    series: "Chrysanthemum Clockwork", ch: "142", event: "imported", group: "NullScan",           size: "28.4 MB", src: "MangaDex" },
  { when: "11m ago",   series: "Harbor Light 17",         ch: "18",  event: "imported", group: "Harbor 17",          size: "41.9 MB", src: "MangaDex" },
  { when: "28m ago",   series: "Verdigris & Brass",       ch: "200", event: "grabbed",  group: "Verdigris Group",    size: "33.1 MB", src: "MangaDex" },
  { when: "44m ago",   series: "Plum Season",             ch: "41",  event: "imported", group: "Paperback Lanterns", size: "19.8 MB", src: "MangaDex" },
  { when: "1h ago",    series: "Twilight Commuter",       ch: "94",  event: "imported", group: "Twilight Scans",     size: "22.0 MB", src: "MangaDex" },
  { when: "1h ago",    series: "Ironkite",                ch: "52",  event: "imported", group: "Ironkite",           size: "30.6 MB", src: "MangaDex" },
  { when: "2h ago",    series: "Signal Flare",            ch: "74",  event: "grabbed",  group: "Signal Flare",       size: "26.7 MB", src: "MangaDex" },
  { when: "3h ago",    series: "Halftone Boys",           ch: "32",  event: "imported", group: "Halftone Collective",size: "17.2 MB", src: "MangaDex" },
  { when: "3h ago",    series: "Moonwell",                ch: "308", event: "imported", group: "Moonwell Translations", size: "35.5 MB", src: "MangaDex" },
  { when: "4h ago",    series: "The Cartography Club",    ch: "45",  event: "imported", group: "NullScan",           size: "21.3 MB", src: "MangaSee" },
  { when: "5h ago",    series: "Nightjar, After Midnight",ch: "41",  event: "imported", group: "Kuro Ink",           size: "24.1 MB", src: "MangaDex" },
  { when: "6h ago",    series: "Kuro Ink Diaries",        ch: "54",  event: "imported", group: "Kuro Ink",           size: "18.9 MB", src: "Bato"     },
  { when: "7h ago",    series: "Paperback Lanterns",      ch: "156", event: "imported", group: "Paperback Lanterns", size: "27.4 MB", src: "MangaDex" },
  { when: "9h ago",    series: "The Paper Lanternmaker",  ch: "65",  event: "imported", group: "Paperback Lanterns", size: "20.8 MB", src: "MangaDex" },
  { when: "11h ago",   series: "Third Shift",             ch: "10",  event: "imported", group: "Low Tide Press",     size: "16.1 MB", src: "MangaDex" },
  { when: "12h ago",   series: "Ferrous Heart",           ch: "124", event: "imported", group: "Ironkite",           size: "29.9 MB", src: "MangaDex" },
  { when: "14h ago",   series: "North of Nowhere",        ch: "26",  event: "imported", group: "Rainfall Scans",     size: "22.5 MB", src: "MangaSee" },
  { when: "18h ago",   series: "The Last Dispatch",       ch: "22",  event: "failed",   group: "Signal Flare",       size: "—",       src: "MangaDex" },
  { when: "20h ago",   series: "Ironkite",                ch: "51",  event: "imported", group: "Ironkite",           size: "30.1 MB", src: "MangaDex" },
  { when: "1d ago",    series: "Verdigris & Brass",       ch: "198", event: "imported", group: "Verdigris Group",    size: "32.2 MB", src: "MangaDex" },
  { when: "1d ago",    series: "Chrysanthemum Clockwork", ch: "141", event: "imported", group: "NullScan",           size: "27.8 MB", src: "MangaDex" },
  { when: "1d ago",    series: "Moonwell",                ch: "307", event: "imported", group: "Moonwell Translations", size: "34.2 MB", src: "MangaDex" },
  { when: "2d ago",    series: "Plum Season",             ch: "40",  event: "imported", group: "Paperback Lanterns", size: "19.0 MB", src: "MangaDex" },
  { when: "2d ago",    series: "Twilight Commuter",       ch: "93",  event: "imported", group: "Twilight Scans",     size: "21.6 MB", src: "MangaDex" },
];

// For Add/search — what the user is browsing to add
const SEARCH_RESULTS = [
  { t: "Under the Northbound Sky",  a: "R. Mochizuki",  y: 2024, s: "ongoing",   g: ["Adventure","Fantasy"],      rt: 8.4, ch: 14,  src: "AniList", hue: 210, added: false },
  { t: "A Letter to Midori",        a: "N. Sakaki",     y: 2023, s: "ongoing",   g: ["Romance","Drama"],          rt: 8.1, ch: 22,  src: "AniList", hue: 340, added: false },
  { t: "Brass Bell Detective",      a: "P. Achterberg", y: 2022, s: "ongoing",   g: ["Mystery","Historical"],     rt: 7.9, ch: 38,  src: "MAL",     hue: 40,  added: false },
  { t: "Zero-Gravity Garden",       a: "T. Kamioka",    y: 2025, s: "ongoing",   g: ["Sci-Fi","Slice of Life"],   rt: 8.0, ch: 4,   src: "AniList", hue: 160, added: false },
  { t: "The Municipal Library",     a: "E. Dufresne",   y: 2021, s: "completed", g: ["Drama"],                    rt: 9.0, ch: 60,  src: "MAL",     hue: 20,  added: true  },
  { t: "Cargo of Whales",           a: "K. Lindqvist",  y: 2023, s: "ongoing",   g: ["Adventure","Drama"],        rt: 8.2, ch: 11,  src: "AniList", hue: 220, added: false },
];

// Build chapter list for a series (for series-detail screen)
function chaptersFor(series) {
  const list = [];
  const groups = ["NullScan", "Paperback Lanterns", "Verdigris Group", "Kuro Ink"];
  const total = Math.min(series.ch, 36);
  const startAt = Math.max(1, series.ch - total + 1);
  for (let i = 0; i < total; i++) {
    const n = startAt + i;
    const isHave = n <= series.have;
    const vol = Math.floor((n - 1) / 6) + 1;
    list.push({
      n: String(n),
      vol,
      title: ["A Small Returning","The Last Ferry","An Open Door","Rooftops","Green Rain","Seven Telegrams","Handbook","The Attic","Dinner with the Ambassador","In the Archive","Blue Hour","Thirdhand Smoke"][i % 12],
      group: groups[(n + vol) % groups.length],
      size: (14 + ((n * 7) % 22)).toFixed(1) + " MB",
      age: ["2d 14h","3h 22m","9h 11m","1w 04d","6h 18m","40m","2h","12h","3d 20h","5h 12m"][i % 10],
      have: isHave,
      monitor: true,
      lang: (n % 9 === 0) ? "jp" : "en",
    });
  }
  return list.reverse(); // newest on top
}

window.MANGARR_DATA = {
  GROUPS, STATUSES, SERIES, WANTED, HISTORY, SEARCH_RESULTS, chaptersFor
};
