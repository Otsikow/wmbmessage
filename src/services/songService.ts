import type { Song } from "@/types/songs";
import bundledSongs from "@/data/songs.json";

/**
 * Song service.
 *
 * The bundled dataset (`src/data/songs.json`) was parsed from the official
 * SV Fellowship Song Book PDF. We keep this as the reliable, offline-first
 * source so the Songs feature is always usable. A future remote source
 * (e.g. https://svfellowship.info/song-book/) can be wired in here behind
 * the same `loadSongs()` interface without any UI changes.
 */
export async function loadSongs(): Promise<Song[]> {
  // Defensive copy + sort by number
  const songs = (bundledSongs as Song[]).slice().sort((a, b) => a.number - b.number);
  return songs;
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
