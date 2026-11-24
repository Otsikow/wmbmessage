import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { getReadingForDate } from "@/data/dailyReadings";
import type { ArchivedMessage, MessageEntry } from "@/lib/messageArchive";

test("each calendar reading has Scripture and an exact, attributable transcript excerpt", async () => {
  const archive = new URL("../public/data/message-archive/", import.meta.url);
  const catalog = JSON.parse(await readFile(new URL("catalog.json", archive), "utf8")) as MessageEntry[];
  const readings = new Set(Array.from({ length: 366 }, (_, day) => getReadingForDate(new Date(2024, 0, day + 1))));
  const batches = new Map<string, ArchivedMessage[]>();

  for (const { verse, message } of readings) {
    assert.ok(verse.text.trim(), verse.reference);
    const entry = catalog.find(({ code }) => code === message.code);
    assert.ok(entry, message.code);
    assert.equal(entry.title, message.title);

    let batch = batches.get(entry.file);
    if (!batch) {
      const compressed = await readFile(new URL(entry.file, archive));
      batch = JSON.parse(gunzipSync(compressed).toString("utf8")) as ArchivedMessage[];
      batches.set(entry.file, batch);
    }

    const source = batch.find(([code]) => code === message.code)?.[2][message.paragraph];
    assert.ok(source, `${message.code}, ¶ ${message.number}`);
    assert.equal(source[0] || String(message.paragraph + 1), message.number);
    assert.ok(message.text.trim() && source[1].includes(message.text), verse.reference);
  }

  const novemberReading = getReadingForDate(new Date(2026, 10, 24));
  assert.equal(novemberReading.verse.reference, "Isaiah 40:31");
  assert.equal(novemberReading.message.code, "59-0708E");
});
