import type { Song } from "@/types/songs";
import { BUNDLED_SONGS } from "@/data/songs";

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

let cache: Song[] | null = null;
let inflight: Promise<Song[]> | null = null;

function sortByNumber(songs: Song[]): Song[] {
  return songs.slice().sort((a, b) => a.number - b.number);
}

async function fetchRemoteSongs(): Promise<Song[]> {
  const res = await fetch(REMOTE_SONGS_URL, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load songs: ${res.status}`);
  const data = (await res.json()) as Song[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Remote songs payload is empty");
  }
  return sortByNumber(data);
}

async function loadNodeSongs(): Promise<Song[]> {
  const mod = await import("../../public/data/songs.json");
  const data = (mod.default ?? mod) as Song[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Node songs payload is empty");
  }
  return sortByNumber(data);
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
      console.warn(
        "[songService] Falling back to bundled songs dataset:",
        err,
      );

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

      const bundledFallback = sortByNumber(BUNDLED_SONGS);
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
