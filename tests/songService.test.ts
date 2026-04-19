import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { loadSongs, searchSongs } from "@/services/songService";

describe("songService", () => {
  test("loads full songs dataset", async () => {
    const songs = await loadSongs();
    assert.equal(songs.length, 366);
    assert.equal(songs[0].number, 1);
    assert.equal(songs[songs.length - 1].number, 942);
    for (const s of songs) {
      assert.ok(s.sections.length > 0, `song ${s.number} has no sections`);
      assert.ok(s.title.length > 0, `song ${s.number} has empty title`);
    }
  });

  test("parses choruses distinctly from verses", async () => {
    const songs = await loadSongs();
    const onlyBelieve = songs.find((s) => s.number === 1)!;
    assert.match(onlyBelieve.title, /only believe/i);
    assert.ok(onlyBelieve.sections.some((s) => s.type === "chorus"));
    assert.ok(onlyBelieve.sections.some((s) => s.type === "verse"));
  });

  test("searches by exact song number", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "2");
    assert.equal(results[0].number, 2);
    assert.match(results[0].title, /amazing grace/i);
  });

  test("searches by title fragment", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "amazing");
    assert.ok(results.length > 0);
    assert.match(results[0].title.toLowerCase(), /amazing/);
  });

  test("searches by lyrics fragment", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "sweet hour of prayer");
    assert.ok(results.some((s) => /sweet hour of prayer/i.test(s.title)));
  });

  test("normalizes punctuation and apostrophes in search", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "were marching to zion");
    assert.ok(results.some((s) => /marching to zion/i.test(s.title)));
  });

  test("returns all songs for empty query", async () => {
    const songs = await loadSongs();
    const results = searchSongs(songs, "");
    assert.equal(results.length, songs.length);
  });
});
