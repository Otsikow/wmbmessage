const REMOTE_KJV_URLS = [
  "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/kjv.json",
  "https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/kjv.json",
];
const LOCAL_SAMPLE_PATH = "/sample-data/bible-verses-sample.json";
const LOCAL_STORAGE_KEY = "messageguide:kjv:raw-v1";
const FETCH_TIMEOUT_MS = 15000;

interface RemoteBibleBook {
  name: string;
  chapters: (string | null)[][];
}

export interface BibleVerseRecord {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

let cachedVerses: BibleVerseRecord[] | null = null;
let chapterIndex: Map<string, BibleVerseRecord[]> | null = null;

export async function loadKJVBibleVerses(): Promise<BibleVerseRecord[]> {
  if (cachedVerses) {
    return cachedVerses;
  }

  const raw = await loadRawBibleData();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as RemoteBibleBook[];
      cachedVerses = flattenRemoteBible(parsed);
      return cachedVerses;
    } catch (error) {
      console.warn("Failed to parse remote KJV dataset:", error);
    }
  }

  const fallback = await loadLocalSampleVerses();
  cachedVerses = fallback;
  return cachedVerses;
}

export async function getChapterVerses(
  book: string,
  chapter: number
): Promise<BibleVerseRecord[]> {
  const verses = await loadKJVBibleVerses();

  if (!chapterIndex) {
    chapterIndex = new Map();
    for (const verse of verses) {
      const key = buildChapterKey(verse.book, verse.chapter);
      const existing = chapterIndex.get(key);
      if (existing) {
        existing.push(verse);
      } else {
        chapterIndex.set(key, [verse]);
      }
    }
  }

  const key = buildChapterKey(book, chapter);
  const matches = chapterIndex.get(key);
  return matches ? [...matches] : [];
}

export async function getVerseText(
  book: string,
  chapter: number,
  verse: number
): Promise<string | null> {
  const chapterVerses = await getChapterVerses(book, chapter);
  const match = chapterVerses.find((record) => record.verse === verse);
  return match?.text ?? null;
}

export function isWordsOfJesus(
  book: string,
  chapter: number,
  verse: number
): boolean {
  const normalizedBook = book.trim().toLowerCase();
  const bookRanges = JESUS_WORDS_RANGES[normalizedBook];
  if (!bookRanges) return false;

  const chapterRanges = bookRanges[chapter];
  if (!chapterRanges) return false;

  return chapterRanges.some(([start, end]) => verse >= start && verse <= end);
}

async function loadRawBibleData(): Promise<string | null> {
  if (typeof window !== "undefined") {
    try {
      const cached = window.localStorage?.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Unable to read cached Bible dataset:", error);
    }
  }

  for (const url of REMOTE_KJV_URLS) {
    try {
      const response = await fetch(url, {
        signal: createTimeoutSignal(FETCH_TIMEOUT_MS),
        cache: "force-cache",
      });

      if (response.ok) {
        const raw = await response.text();
        if (raw && typeof window !== "undefined") {
          try {
            window.localStorage?.setItem(LOCAL_STORAGE_KEY, raw);
          } catch (error) {
            console.warn("Unable to cache KJV dataset:", error);
          }
        }
        return raw;
      }
    } catch (error) {
      console.warn(`Unable to download KJV dataset from ${url}:`, error);
    }
  }

  return null;
}

function flattenRemoteBible(books: RemoteBibleBook[]): BibleVerseRecord[] {
  const verses: BibleVerseRecord[] = [];

  books.forEach((book) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((text, verseIndex) => {
        if (!text) return;
        const cleaned = text.replace(/<[^>]*>/g, "").trim();
        if (!cleaned) return;

        verses.push({
          book: book.name,
          chapter: chapterIndex + 1,
          verse: verseIndex + 1,
          text: cleaned,
        });
      });
    });
  });

  return verses;
}

async function loadLocalSampleVerses(): Promise<BibleVerseRecord[]> {
  try {
    const response = await fetch(LOCAL_SAMPLE_PATH);
    if (!response.ok) {
      throw new Error("Failed to load local Bible sample");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((entry) => {
        if (
          typeof entry.book === "string" &&
          typeof entry.chapter === "number" &&
          typeof entry.verse === "number" &&
          typeof entry.text === "string"
        ) {
          return {
            book: entry.book,
            chapter: entry.chapter,
            verse: entry.verse,
            text: entry.text.trim(),
          } satisfies BibleVerseRecord;
        }
        return null;
      })
      .filter((record): record is BibleVerseRecord => record !== null);
  } catch (error) {
    console.warn("Unable to load Bible sample dataset:", error);
    return [];
  }
}

function buildChapterKey(book: string, chapter: number) {
  return `${book.trim().toLowerCase()}-${chapter}`;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(timeoutMs);
  }

  if (typeof AbortController === "undefined") {
    return undefined;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

const JESUS_WORDS_RANGES: Record<
  string,
  Record<number, Array<[number, number]>>
> = {
  matthew: {
    5: [[3, 48]],
    6: [[1, 34]],
    7: [[1, 29]],
    11: [[28, 30]],
    13: [[3, 52]],
    16: [[13, 28]],
    22: [[37, 40]],
    24: [[4, 51]],
    25: [[1, 46]],
    26: [[26, 29]],
  },
  mark: {
    1: [[15, 17]],
    4: [[9, 41]],
    8: [[34, 38]],
    10: [[14, 45]],
    13: [[5, 37]],
  },
  luke: {
    4: [[4, 12]],
    6: [[20, 49]],
    10: [[23, 37]],
    11: [[9, 13]],
    12: [[4, 59]],
    15: [[4, 32]],
    22: [[15, 20]],
    24: [[38, 49]],
  },
  john: {
    3: [[3, 21]],
    4: [[7, 26]],
    5: [[19, 47]],
    6: [[26, 71]],
    8: [[12, 58]],
    10: [[1, 38]],
    14: [[1, 31]],
    15: [[1, 27]],
    16: [[1, 33]],
    17: [[1, 26]],
  },
};
