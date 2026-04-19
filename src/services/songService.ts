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
      const fallback = sortByNumber(BUNDLED_SONGS);
      cache = fallback;
      return fallback;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export interface SongSearchOptions {
  /** Max results to return; default 200 */
  limit?: number;
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
  const { limit = 200 } = options;
  const q = query.trim().toLowerCase();
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
    if (song.title.toLowerCase().includes(q)) {
      titleMatch.push(song);
      continue;
    }
    if (song.searchText.includes(q)) {
      lyricsMatch.push(song);
    }
  }

  return [...numberMatch, ...titleMatch, ...lyricsMatch].slice(0, limit);
}
