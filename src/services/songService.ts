import type { Song, SongSection, SongSectionType } from "@/types/songs";
import { BUNDLED_SONGS } from "@/data/songs";
import { toTitleCase } from "@/lib/titleCase";

/**
 * Song service.
 *
 * Primary source: /data/songs.json (the full 385-song dataset parsed from the
 * official SV Fellowship Song Book PDF, served from /public so the bundle stays
 * small). If the fetch fails (offline / network error), we fall back to the
 * smaller bundled dataset baked into the JS so the Songs feature is always
 * usable.
 */

const REMOTE_SONGS_URL = "/data/songs.json";
const PRESENTER_SONGS_URL = "/data/presenter-songs.json";
const SECTION_MARKER_REGEX = /^(chorus|refrain|bridge|verse)(?:\s+\d+)?$/i;

let cache: Song[] | null = null;
let inflight: Promise<Song[]> | null = null;

function sortByNumber(songs: Song[]): Song[] {
  return songs.slice().sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity));
}

function normalizeLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Pick a stanza size that splits `lineCount` lines evenly when possible.
 * Hymns are typically grouped in 4- or 8-line stanzas, so we prefer those.
 */
function pickStanzaSize(lineCount: number): number {
  if (lineCount <= 6) return lineCount;
  if (lineCount % 4 === 0) return 4;
  if (lineCount % 8 === 0) return 8;
  if (lineCount % 6 === 0) return 6;
  if (lineCount % 5 === 0) return 5;
  if (lineCount % 3 === 0) return 3;
  return 4;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function lineKey(line: string): string {
  return line
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a flat list of verse lines into stanzas. Prefer detecting a repeating
 * opening phrase that begins each verse (very common in our songbook, e.g.
 * "Fear not, little flock,"). Fall back to even chunking when no repeat exists.
 */
function splitVerseLines(lines: string[]): string[][] {
  if (lines.length <= 6) return [lines];

  const counts = new Map<string, number>();
  for (const l of lines) {
    const k = lineKey(l);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const k = lineKey(lines[i]);
    if (k && (counts.get(k) ?? 0) >= 2) starts.push(i);
  }

  if (starts.length >= 2) {
    // Anything before the first repeated start is treated as an intro stanza.
    const boundaries = starts[0] > 0 ? [0, ...starts] : starts;
    const out: string[][] = [];
    for (let i = 0; i < boundaries.length; i++) {
      const end = i + 1 < boundaries.length ? boundaries[i + 1] : lines.length;
      const stanza = lines.slice(boundaries[i], end);
      if (stanza.length) out.push(stanza);
    }
    return out;
  }

  const size = pickStanzaSize(lines.length);
  return chunk(lines, size);
}

/**
 * Parse rawText into sections, respecting inline CHORUS / REFRAIN / BRIDGE /
 * VERSE markers wherever they appear — not just at the start of a block.
 */
function buildSectionsFromRawText(rawText: string, _chorus: string | null): SongSection[] {
  const allLines = rawText.split("\n").map((l) => l.trim());

  type Segment = { type: SongSectionType | null; label: string | null; lines: string[] };
  const segments: Segment[] = [];
  let current: Segment = { type: null, label: null, lines: [] };

  const flush = () => {
    if (current.lines.length || current.type) segments.push(current);
    current = { type: null, label: null, lines: [] };
  };

  for (const line of allLines) {
    if (!line) {
      flush();
      continue;
    }
    const m = line.match(SECTION_MARKER_REGEX);
    if (m) {
      flush();
      current.type = m[1].toLowerCase() as SongSectionType;
      current.label = line.toUpperCase();
      continue;
    }
    current.lines.push(line);
  }
  flush();

  const out: SongSection[] = [];
  for (const seg of segments) {
    if (seg.lines.length === 0) continue;

    if (seg.type === "chorus" || seg.type === "refrain" || seg.type === "bridge") {
      // A marker like CHORUS in the source PDF often swallows everything that
      // follows. Treat the first stanza as the chorus and split the rest into
      // verses using the repeating-opening heuristic above.
      const chorusLen = seg.lines.length <= 6 ? seg.lines.length : 4;
      out.push({
        type: seg.type,
        label: seg.label ?? seg.type.toUpperCase(),
        lines: seg.lines.slice(0, chorusLen),
      });
      const rest = seg.lines.slice(chorusLen);
      if (rest.length) {
        for (const stanza of splitVerseLines(rest)) {
          out.push({ type: "verse", label: null, lines: stanza });
        }
      }
      continue;
    }

    if (seg.type === "verse") {
      for (const stanza of splitVerseLines(seg.lines)) {
        out.push({ type: "verse", label: seg.label, lines: stanza });
      }
      continue;
    }

    // Untagged segment: split into verses.
    for (const stanza of splitVerseLines(seg.lines)) {
      out.push({ type: "verse", label: null, lines: stanza });
    }
  }

  return out;
}

function normalizeSong(song: Song): Song {
  const rebuiltSections = buildSectionsFromRawText(song.rawText, song.chorus);
  const title = toTitleCase(song.title);


  if (rebuiltSections.length === 0) {
    return title === song.title ? song : { ...song, title };
  }

  const firstChorus = rebuiltSections.find((section) => section.type === "chorus");

  return {
    ...song,
    title,
    sections: rebuiltSections,
    chorus: firstChorus ? firstChorus.lines.join("\n") : null,
  };
}

function normalizeSongCollection(songs: Song[]): Song[] {
  return songs.map(normalizeSong);
}

async function fetchRemoteSongs(): Promise<Song[]> {
  const res = await fetch(REMOTE_SONGS_URL, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load songs: ${res.status}`);
  const data = (await res.json()) as Song[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Remote songs payload is empty");
  }
  return sortByNumber(normalizeSongCollection(data));
}

async function loadNodeSongs(): Promise<Song[]> {
  const localPath = "../../public/data/songs.json";
  const mod = await import(/* @vite-ignore */ localPath, { with: { type: "json" } });
  const data = (mod.default ?? mod) as Song[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Node songs payload is empty");
  }
  return sortByNumber(normalizeSongCollection(data));
}

async function loadFellowshipSongs(): Promise<Song[]> {
  try {
    return typeof window === "undefined" ? await loadNodeSongs() : await fetchRemoteSongs();
  } catch (error) {
    console.warn("[songService] Falling back to the bundled Song Book:", error);
    return sortByNumber(normalizeSongCollection(BUNDLED_SONGS));
  }
}

type PresenterSong = Pick<Song, "id" | "number" | "title" | "sections">;

async function loadPresenterSongs(): Promise<Song[]> {
  let songs: PresenterSong[];
  if (typeof window === "undefined") {
    const localPath = "../../public/data/presenter-songs.json";
    songs = (await import(/* @vite-ignore */ localPath, { with: { type: "json" } })).default as PresenterSong[];
  } else {
    const response = await fetch(PRESENTER_SONGS_URL);
    if (!response.ok) throw new Error(`Could not load Church Presenter songs (${response.status})`);
    songs = await response.json();
  }

  return songs.map((song) => {
    const lyrics = song.sections.map((section) => section.lines.join("\n")).join("\n\n");
    return {
      ...song,
      collection: "presenter",
      chorus: song.sections.find((section) => section.type === "chorus")?.lines.join("\n") ?? null,
      lyrics,
      rawText: lyrics,
      searchText: lyrics.toLowerCase(),
    };
  });
}

export async function loadSongs(): Promise<Song[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = Promise.allSettled([loadFellowshipSongs(), loadPresenterSongs()])
    .then(([fellowship, presenter]) => {
      if (fellowship.status === "rejected") throw fellowship.reason;
      if (presenter.status === "rejected") {
        console.warn("[songService] Could not load the Church Presenter collection:", presenter.reason);
        return fellowship.value;
      }
      cache = [...fellowship.value, ...presenter.value];
      return cache;
    })
    .finally(() => { inflight = null; });

  return inflight;
}

export function songQuery(song: Song) {
  return { song: song.collection === "presenter" ? song.id : String(song.number) };
}

export function songPath(song: Song) {
  return `/songs?${new URLSearchParams(songQuery(song))}`;
}

export function songReference(song: Song) {
  return song.number === null ? "Church Presenter" : `Song ${song.number}`;
}

export function songSectionLabel(section: SongSection, verseNumber: number) {
  if (section.label) return section.label;
  if (section.type === "verse") return `Verse ${verseNumber}`;
  if (section.type === "other") return "Section";
  return section.type[0].toUpperCase() + section.type.slice(1);
}

export interface SongSearchOptions {
  /** Max results to return; default is unbounded */
  limit?: number;
  displayTitle?: (song: Song) => string | undefined;
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Search songs by number, title, or lyrics.
 * Returns songs ranked: number-match → title-match → lyrics-match.
 */
const searchIndex = new WeakMap<Song, { title: string; lyrics: string }>();

export function searchSongs(
  songs: Song[],
  query: string,
  options: SongSearchOptions = {},
): Song[] {
  const { limit = Number.POSITIVE_INFINITY, displayTitle } = options;
  const q = normalizeForSearch(query);
  if (!q) return songs.slice(0, limit);

  const numberMatch: Song[] = [];
  const titleMatch: Song[] = [];
  const lyricsMatch: Song[] = [];

  const asNumber = Number.parseInt(q, 10);
  const isNumberQuery = !Number.isNaN(asNumber) && /^\d+$/.test(q);

  for (const song of songs) {
    if (isNumberQuery) {
      if (song.number === asNumber) numberMatch.push(song);
      continue;
    }

    let index = searchIndex.get(song);
    if (!index) {
      index = { title: normalizeForSearch(song.title), lyrics: normalizeForSearch(song.searchText) };
      searchIndex.set(song, index);
    }
    const alternateTitle = displayTitle?.(song);
    if (index.title.includes(q) || (alternateTitle && normalizeForSearch(alternateTitle).includes(q))) {
      titleMatch.push(song);
      continue;
    }

    if (index.lyrics.includes(q)) {
      lyricsMatch.push(song);
    }
  }

  return [...numberMatch, ...titleMatch, ...lyricsMatch].slice(0, limit);
}