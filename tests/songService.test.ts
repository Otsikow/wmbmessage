import { describe, it, expect } from "vitest";
import { searchSongs, loadSongs } from "../src/services/songService";

describe("songService", () => {
  it("loads all 81 songs with sequential numbers", async () => {
    const songs = await loadSongs();
    expect(songs.length).toBe(81);
    expect(songs[0].number).toBe(1);
    expect(songs[songs.length - 1].number).toBe(81);
    // Each song has at least one section
    for (const s of songs) {
      expect(s.sections.length).toBeGreaterThan(0);
      expect(s.title.length).toBeGreaterThan(0);
    }
  });

  it("parses choruses distinctly from verses", async () => {
    const songs = await loadSongs();
    const onlyBelieve = songs.find((s) => s.number === 1)!;
    expect(onlyBelieve.title).toMatch(/only believe/i);
    expect(onlyBelieve.sections.some((s) => s.type === "chorus")).toBe(true);
    expect(onlyBelieve.sections.some((s) => s.type === "verse")).toBe(true);
  });

  it("searches by exact song number", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "2");
    expect(results[0].number).toBe(2);
    expect(results[0].title).toMatch(/amazing grace/i);
  });

  it("searches by title fragment", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "amazing");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title.toLowerCase()).toContain("amazing");
  });

  it("searches by lyrics fragment", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "sweet hour of prayer");
    expect(results.some((s) => /sweet hour of prayer/i.test(s.title))).toBe(true);
  });

  it("returns all songs for empty query", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "");
    expect(results.length).toBe(songs.length);
  });
});
