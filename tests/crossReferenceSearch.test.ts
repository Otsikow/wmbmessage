import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  searchCrossReferences,
  type CrossReferenceRecord,
} from "@/lib/crossReferenceSearch";

const sampleDataPath = path.resolve(
  process.cwd(),
  "public/sample-data/cross-references-sample.json"
);

const crossReferences: CrossReferenceRecord[] = JSON.parse(
  readFileSync(sampleDataPath, "utf-8")
);

describe("searchCrossReferences", () => {
  test("finds cross-references by direct verse lookup", () => {
    const results = searchCrossReferences("John 3:16", crossReferences);

    assert.strictEqual(results.length, 2);
    assert(results.every((ref) => ref.from_book === "John" && ref.from_chapter === 3));
  });

  test("matches keyword queries against notes and metadata", () => {
    const results = searchCrossReferences("love", crossReferences);

    assert.strictEqual(results.length, 2);
    assert(results.every((ref) => ref.notes?.toLowerCase().includes("love")));
  });

  test("returns cross-references that point to the matching book", () => {
    const results = searchCrossReferences("John 10:11", crossReferences);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].from_book, "Psalms");
    assert.strictEqual(results[0].to_book, "John");
  });
});
