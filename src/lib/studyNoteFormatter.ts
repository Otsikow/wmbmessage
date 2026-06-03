// Auto-formatter: turns a pasted plain-text study note into structured blocks
// for beautiful rendering. Pure functions, fully tested-friendly.

export type StudyBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "scripture"; reference: string; text?: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "message-ref"; text: string }
  | { type: "key-point"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "prayer"; text: string }
  | { type: "reflection"; text: string }
  | { type: "paragraph"; text: string };

const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalm","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah",
  "Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation","Revelations",
];

const SCRIPTURE_RE = new RegExp(
  `^\\s*((?:${BIBLE_BOOKS.join("|")})\\s+\\d+(?::\\d+(?:-\\d+)?)?(?:\\s*,\\s*\\d+(?:-\\d+)?)*)\\s*[-–:]?\\s*(.*)$`,
  "i",
);

const SCRIPTURE_INLINE_RE = new RegExp(
  `\\b(?:${BIBLE_BOOKS.join("|")})\\s+\\d+(?::\\d+(?:-\\d+)?)?\\b`,
  "gi",
);

function isHeadingLine(line: string): 1 | 2 | 3 | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (/^#{1,3}\s+/.test(trimmed)) {
    const hashes = trimmed.match(/^#+/)?.[0].length ?? 1;
    return Math.min(hashes, 3) as 1 | 2 | 3;
  }
  // ALL CAPS short lines = heading
  if (trimmed.length <= 80 && /^[A-Z0-9 ,'":!?&\-]+$/.test(trimmed) && /[A-Z]/.test(trimmed)) {
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount <= 10) return 1;
    if (wordCount <= 15) return 2;
  }
  // Title case short line ending without punctuation
  if (
    trimmed.length <= 70 &&
    !/[.!?]$/.test(trimmed) &&
    /^[A-Z]/.test(trimmed) &&
    trimmed.split(/\s+/).length <= 10
  ) {
    return 2;
  }
  return null;
}

function isQuoteLine(line: string): boolean {
  const t = line.trim();
  return (
    t.startsWith(">") ||
    (t.startsWith('"') && t.endsWith('"') && t.length > 20) ||
    (t.startsWith("“") && t.endsWith("”"))
  );
}

function isBranhamAttribution(line: string): boolean {
  return /(brother\s+branham|wmb|william\s+marrion\s+branham|—\s*branham|-\s*branham)/i.test(
    line,
  );
}

function isMessageRefLine(line: string): boolean {
  const t = line.trim();
  return (
    /^message[:\s]/i.test(t) ||
    /^sermon[:\s]/i.test(t) ||
    /\b\d{2}-\d{4}[A-Z]?\b/.test(t) || // sermon code like 65-0418M
    /^reference[:\s]/i.test(t)
  );
}

function isKeyPointLine(line: string): boolean {
  return /^(key point|important|note|remember)[:\s]/i.test(line.trim());
}

function isPrayerLine(line: string): boolean {
  return /^prayer[:\s]/i.test(line.trim());
}

function isReflectionLine(line: string): boolean {
  return /^(reflection|reflect|meditate)[:\s]/i.test(line.trim());
}

function isListItem(line: string): { ordered: boolean; text: string } | null {
  const t = line.trim();
  const ordered = t.match(/^(\d+)[.)]\s+(.*)$/);
  if (ordered) return { ordered: true, text: ordered[2] };
  const bullet = t.match(/^[-*•·]\s+(.*)$/);
  if (bullet) return { ordered: false, text: bullet[1] };
  return null;
}

export function formatStudyNote(input: string): StudyBlock[] {
  const blocks: StudyBlock[] = [];
  // Normalize line endings & collapse 3+ blank lines
  const lines = input.replace(/\r\n?/g, "\n").split("\n");

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) {
      i++;
      continue;
    }

    // Scripture line: starts with a Bible reference
    const scriptureMatch = line.match(SCRIPTURE_RE);
    if (scriptureMatch && scriptureMatch[1]) {
      const ref = scriptureMatch[1].trim();
      let text = scriptureMatch[2]?.trim() || "";
      // Continue capturing wrapped verse lines (indented or continuation)
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) break;
        if (isHeadingLine(next)) break;
        if (next.match(SCRIPTURE_RE)) break;
        if (isQuoteLine(next) || isListItem(next)) break;
        if (isMessageRefLine(next) || isKeyPointLine(next)) break;
        text = text ? `${text} ${next}` : next;
        j++;
      }
      blocks.push({ type: "scripture", reference: ref, text: text || undefined });
      i = j;
      continue;
    }

    // Heading
    const headingLevel = isHeadingLine(line);
    if (headingLevel) {
      const cleaned = line.replace(/^#+\s+/, "").trim();
      blocks.push({ type: "heading", level: headingLevel, text: cleaned });
      i++;
      continue;
    }

    // Quote block (Brother Branham / WMB)
    if (isQuoteLine(line)) {
      let text = line
        .replace(/^>\s?/, "")
        .replace(/^[“"]/, "")
        .replace(/[”"]$/, "")
        .trim();
      let j = i + 1;
      let attribution: string | undefined;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) break;
        if (isBranhamAttribution(next) && next.length < 120) {
          attribution = next.replace(/^[—-]\s*/, "").trim();
          j++;
          break;
        }
        if (isHeadingLine(next) || next.match(SCRIPTURE_RE) || isListItem(next)) break;
        text += " " + next.replace(/[”"]$/, "");
        j++;
      }
      blocks.push({ type: "quote", text, attribution });
      i = j;
      continue;
    }

    // Message reference
    if (isMessageRefLine(line)) {
      blocks.push({ type: "message-ref", text: line.replace(/^(message|sermon|reference)[:\s]+/i, "").trim() || line });
      i++;
      continue;
    }

    // Key point
    if (isKeyPointLine(line)) {
      blocks.push({ type: "key-point", text: line.replace(/^(key point|important|note|remember)[:\s]+/i, "").trim() });
      i++;
      continue;
    }

    // Prayer / Reflection
    if (isPrayerLine(line)) {
      blocks.push({ type: "prayer", text: line.replace(/^prayer[:\s]+/i, "").trim() });
      i++;
      continue;
    }
    if (isReflectionLine(line)) {
      blocks.push({ type: "reflection", text: line.replace(/^(reflection|reflect|meditate)[:\s]+/i, "").trim() });
      i++;
      continue;
    }

    // Lists
    const listItem = isListItem(line);
    if (listItem) {
      const ordered = listItem.ordered;
      const items: string[] = [listItem.text];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next) break;
        const li = isListItem(next);
        if (!li || li.ordered !== ordered) break;
        items.push(li.text);
        j++;
      }
      blocks.push({ type: "list", ordered, items });
      i = j;
      continue;
    }

    // Plain paragraph (may span multiple lines until a blank or special line)
    let para = line;
    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j].trim();
      if (!next) break;
      if (
        isHeadingLine(next) ||
        next.match(SCRIPTURE_RE) ||
        isQuoteLine(next) ||
        isListItem(next) ||
        isMessageRefLine(next) ||
        isKeyPointLine(next) ||
        isPrayerLine(next) ||
        isReflectionLine(next)
      )
        break;
      para += " " + next;
      j++;
    }
    blocks.push({ type: "paragraph", text: para });
    i = j;
  }

  return blocks;
}

export function extractScriptureRefs(input: string): string[] {
  const matches = input.match(SCRIPTURE_INLINE_RE) || [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

export function buildExcerpt(input: string, max = 200): string {
  const text = input.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
