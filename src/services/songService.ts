import type { Song, SongSection, SongSectionType } from "@/types/songs";
import { BUNDLED_SONGS } from "@/data/songs";
import { toTitleCase } from "@/lib/titleCase";

/**
 * Song service.
 *
 * Primary source: /data/songs.json (the full 366-song dataset parsed from the
 * official SV Fellowship Song Book PDF, served from /public so the bundle stays
 * small). If the fetch fails (offline / network error), we fall back to the
 * smaller bundled dataset baked into the JS so the Songs feature is always
 * usable.
 */

const REMOTE_SONGS_URL = "/data/songs.json";
const SECTION_MARKER_REGEX = /^(chorus|refrain|bridge|verse)(?:\s+\d+)?$/i;

let cache: Song[] | null = null;
let inflight: Promise<Song[]> | null = null;

function sortByNumber(songs: Song[]): Song[] {
  return songs.slice().sort((a, b) => a.number - b.number);
}

function normalizeLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildSectionsFromRawText(rawText: string, chorus: string | null): SongSection[] {
  const blocks = rawText
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const chorusSignature = chorus
    ? normalizeLines(chorus).join("\n").toLowerCase()
    : null;

  const sections: SongSection[] = [];
  let pendingMarker: { type: SongSectionType; label: string } | null = null;

  for (const block of blocks) {
    const blockLines = normalizeLines(block);
    if (blockLines.length === 0) continue;

    const markerMatch = blockLines[0].match(SECTION_MARKER_REGEX);
    if (markerMatch) {
      const markerType = markerMatch[1].toLowerCase() as SongSectionType;
      const label = blockLines[0].toUpperCase();
      const remainingLines = blockLines.slice(1);

      if (remainingLines.length === 0) {
        pendingMarker = { type: markerType, label };
        continue;
      }

      sections.push({
        type: markerType,
        label,
        lines: remainingLines,
      });
      pendingMarker = null;
      continue;
    }

    if (pendingMarker) {
      sections.push({
        type: pendingMarker.type,
        label: pendingMarker.label,
        lines: blockLines,
      });
      pendingMarker = null;
      continue;
    }

    const blockSignature = blockLines.join("\n").toLowerCase();
    const isChorusBlock = chorusSignature !== null && blockSignature === chorusSignature;

    sections.push({
      type: isChorusBlock ? "chorus" : "verse",
      label: isChorusBlock ? "CHORUS" : null,
      lines: blockLines,
    });
  }

  return sections;
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

/**
 * Many songs in the dataset arrive as a single un-separated block of lines.
 * Split each parsed section into uniform 4/8-line stanzas so the reader can
 * label them Verse 1, Verse 2, … and visually separate the chorus.
 */
function expandSections(sections: SongSection[]): SongSection[] {
  const out: SongSection[] = [];

  for (const section of sections) {
    const lines = section.lines;

    if (section.type === "chorus") {
      // Chorus marker often swallows the entire song in the source data.
      // Treat the first 4 lines as the actual chorus; split the rest into verses.
      if (lines.length <= 6) {
        out.push(section);
        continue;
      }
      out.push({ type: "chorus", label: "CHORUS", lines: lines.slice(0, 4) });
      const rest = lines.slice(4);
      const verseSize = pickStanzaSize(rest.length);
      for (const stanza of chunk(rest, verseSize)) {
        out.push({ type: "verse", label: null, lines: stanza });
      }
      continue;
    }

    if (lines.length <= 6) {
      out.push(section);
      continue;
    }

    const verseSize = pickStanzaSize(lines.length);
    for (const stanza of chunk(lines, verseSize)) {
      out.push({ type: "verse", label: null, lines: stanza });
    }
  }

  return out;
}

function normalizeSong(song: Song): Song {
  const rebuiltSections = expandSections(
    buildSectionsFromRawText(song.rawText, song.chorus),
  );
  if (rebuiltSections.length === 0) return song;

  const firstChorus = rebuiltSections.find((section) => section.type === "chorus");

  return {
    ...song,
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
  const mod = await import("../../public/data/songs.json");
  const data = (mod.default ?? mod) as Song[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Node songs payload is empty");
  }
  return sortByNumber(normalizeSongCollection(data));
}

export async function loadSongs(): Promise<Song[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const remote = await fetchRemoteSongs();
      cache = remote;
      return remote;
    } catch (err) {
      console.warn("[songService] Falling back from remote songs dataset:", err);

      // In Node (tests / tools), there is no browser fetch for /public assets.
      // Load the same canonical songs dataset directly from disk.
      if (typeof window === "undefined") {
        try {
          const nodeSongs = await loadNodeSongs();
          cache = nodeSongs;
          return nodeSongs;
        } catch (nodeErr) {
          console.warn(
            "[songService] Node songs fallback failed, using bundled dataset:",
            nodeErr,
          );
        }
      }

      const bundledFallback = sortByNumber(normalizeSongCollection(BUNDLED_SONGS));
      cache = bundledFallback;
      return bundledFallback;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export interface SongSearchOptions {
  /** Max results to return; default is unbounded */
  limit?: number;
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
export function searchSongs(
  songs: Song[],
  query: string,
  options: SongSearchOptions = {},
): Song[] {
  const { limit = Number.POSITIVE_INFINITY } = options;
  const q = normalizeForSearch(query);
  if (!q) return songs.slice(0, limit);

  const numberMatch: Song[] = [];
  const titleMatch: Song[] = [];
  const lyricsMatch: Song[] = [];

  const asNumber = Number.parseInt(q, 10);
  const isNumberQuery = !Number.isNaN(asNumber) && /^\d+$/.test(q);

  for (const song of songs) {
    if (isNumberQuery && song.number === asNumber) {
      numberMatch.push(song);
      continue;
    }

    const normalizedTitle = normalizeForSearch(song.title);
    if (normalizedTitle.includes(q)) {
      titleMatch.push(song);
      continue;
    }

    const normalizedLyrics = normalizeForSearch(song.searchText);
    if (normalizedLyrics.includes(q)) {
      lyricsMatch.push(song);
    }
  }

  return [...numberMatch, ...titleMatch, ...lyricsMatch].slice(0, limit);
}