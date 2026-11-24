import assert from "node:assert/strict";
import { test } from "node:test";
import { arrangementOptions, browseSongs, buildSongCatalogue } from "@/lib/songCatalogue";
import { loadSongs, songPath } from "@/services/songService";

const songs = await loadSongs();
const catalogue = buildSongCatalogue(songs);

test("consolidates duplicate listings while retaining every original arrangement", () => {
  assert.equal(catalogue.entries.length, 1280);
  assert.equal(catalogue.bySong.size, songs.length);
  const entries = browseSongs(catalogue, "Blessed Assurance", "all", "title")
    .filter(({ entry }) => entry.title === "Blessed Assurance");
  assert.equal(entries.length, 1);
  const options = arrangementOptions(entries[0].entry);
  assert.deepEqual(options.map(({ label }) => label), [
    "Fellowship Song Book · No. 176",
    "Church Presenter · No. 176 · Key C",
  ]);
  assert.equal(songPath(options[0].song), "/songs?song=176");
  assert.match(songPath(options[1].song), /^\/songs\?song=presenter-/);
});

test("keeps different songs that share a title and hymn number", () => {
  const entries = browseSongs(catalogue, "184", "all", "number");
  assert.equal(entries.length, 2);
  assert.ok(entries.every(({ entry }) => entry.title === "Beulah Land"));
  assert.match(entries[0].entry.firstLine ?? "", /land of corn and wine/);
  assert.match(entries[1].entry.firstLine ?? "", /homesick for a country/);
});

test("searches the catalogue title and aliases and respects collection filters", () => {
  const alternate = browseSongs(catalogue, "Draw Me Nearer", "presenter", "title");
  assert.ok(alternate.some(({ entry, song }) => entry.title === "I Am Thine, Oh Lord" && song.collection === "presenter"));

  const corrected = browseSongs(catalogue, "Nothing but the Blood", "fellowship", "title");
  assert.ok(corrected.some(({ entry, song }) => entry.title === "Nothing but the Blood" && song.number === 141));

  const matches = browseSongs(catalogue, "heir of salvation", "all", "title");
  assert.equal(matches.filter(({ entry }) => entry.title === "Blessed Assurance").length, 1);
});

test("files punctuation-led titles under their letter", () => {
  const entries = browseSongs(catalogue, "", "all", "title");
  assert.ok(entries.findIndex(({ entry }) => /^[‘’']Tis So Sweet/i.test(entry.title)) >
    entries.findIndex(({ entry }) => /^Blessed Assurance$/i.test(entry.title)));
});
