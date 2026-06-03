import { describe, expect, it } from "vitest";
import {
  formatStudyNote,
  extractScriptureRefs,
  buildExcerpt,
} from "../src/lib/studyNoteFormatter";

describe("formatStudyNote", () => {
  it("detects scripture references as scripture blocks", () => {
    const blocks = formatStudyNote("John 3:16 For God so loved the world.");
    expect(blocks[0].type).toBe("scripture");
    if (blocks[0].type === "scripture") {
      expect(blocks[0].reference).toBe("John 3:16");
      expect(blocks[0].text).toContain("For God so loved");
    }
  });

  it("turns ALL-CAPS short lines into headings", () => {
    const blocks = formatStudyNote("THE GODHEAD\n\nSome body text.");
    expect(blocks[0]).toEqual({
      type: "heading",
      level: 1,
      text: "THE GODHEAD",
    });
  });

  it("captures Brother Branham quote attribution", () => {
    const blocks = formatStudyNote(
      `"There's only one God."\n- Brother Branham`,
    );
    expect(blocks[0].type).toBe("quote");
    if (blocks[0].type === "quote") {
      expect(blocks[0].attribution).toMatch(/Brother Branham/i);
    }
  });

  it("recognizes message references with Message: prefix", () => {
    const blocks = formatStudyNote(
      "Message: Revelation of Jesus Christ (60-1204M)",
    );
    expect(blocks[0].type).toBe("message-ref");
  });

  it("parses ordered and unordered lists", () => {
    const blocks = formatStudyNote("1. Father\n2. Son\n3. Holy Ghost");
    expect(blocks[0].type).toBe("list");
    if (blocks[0].type === "list") {
      expect(blocks[0].ordered).toBe(true);
      expect(blocks[0].items).toHaveLength(3);
    }
  });

  it("creates key-point and prayer blocks from prefixes", () => {
    const blocks = formatStudyNote(
      "Key Point: God is one\n\nPrayer: Help us Lord",
    );
    expect(blocks[0].type).toBe("key-point");
    expect(blocks[1].type).toBe("prayer");
  });
});

describe("extractScriptureRefs", () => {
  it("finds bible references inline", () => {
    const refs = extractScriptureRefs(
      "See John 3:16 and Acts 2:38 for more.",
    );
    expect(refs).toContain("John 3:16");
    expect(refs).toContain("Acts 2:38");
  });
});

describe("buildExcerpt", () => {
  it("truncates long text on a word boundary", () => {
    const text = "word ".repeat(100);
    const out = buildExcerpt(text, 50);
    expect(out.length).toBeLessThanOrEqual(52);
    expect(out.endsWith("…")).toBe(true);
  });
});
