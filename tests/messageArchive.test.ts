import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMessageCatalog, findMessageMatches, messageArchiveLink, type ArchivedMessage, type MessageEntry } from "@/lib/messageArchive";

const archive = new URL("../public/data/message-archive/", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("catalog.json", archive), "utf8")) as MessageEntry[];

test("every catalogue entry resolves to a complete transcript", async () => {
  const files = new Set(catalog.map((message) => message.file));
  const transcripts = new Map<string, string>();
  let paragraphs = 0;
  for (const file of files) {
    const zip = await readFile(new URL(file, archive));
    const batch = JSON.parse(gunzipSync(zip).toString("utf8")) as ArchivedMessage[];
    for (const [code, title, body] of batch) {
      assert.equal(transcripts.has(code), false, `duplicate date code: ${code}`);
      transcripts.set(code, title);
      assert.ok(body.length > 0, `empty transcript: ${code}`);
      paragraphs += body.length;
    }
  }

  assert.equal(catalog.length, 1206);
  assert.equal(transcripts.size, catalog.length);
  assert.equal(paragraphs, 208274);
  for (const { code, title } of catalog) assert.equal(transcripts.get(code), title);
});

test("finds titles and date codes with or without hyphens", () => {
  assert.equal(filterMessageCatalog(catalog, "470412")[0].title, "Faith Is the Substance");
  assert.equal(filterMessageCatalog(catalog, "faith is the substance")[0].code, "47-0412");
  assert.equal(messageArchiveLink("47-0412"), "/messages?q=47-0412");
  assert.equal(messageArchiveLink("some phrase"), "/messages?q=some+phrase&scope=text");
});

test("phrase searches return the matching paragraph and tolerate apostrophe styles and line breaks", () => {
  const messages: ArchivedMessage[] = [
    ["47-0412", "Faith Is the Substance", [
      ["1", "Faith is the substance."],
      ["2", "We’re getting\nsome new gadgets for recording."],
    ]],
  ];

  const [match] = findMessageMatches(messages, "we're getting some new gadgets");
  assert.equal(match.code, "47-0412");
  assert.equal(match.paragraph, 1);
  assert.equal(match.number, "2");
  assert.match(match.excerpt, /gadgets for recording/);
  assert.deepEqual(findMessageMatches(messages, "cord"), []);
});
