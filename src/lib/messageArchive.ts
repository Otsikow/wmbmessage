export interface MessageEntry {
  code: string;
  title: string;
  file: string;
}

export type MessageParagraph = [number: string, text: string];
export type ArchivedMessage = [code: string, title: string, paragraphs: MessageParagraph[]];

export interface MessageMatch {
  code: string;
  title: string;
  paragraph: number;
  number: string;
  excerpt: string;
  rank: number;
}

export const archivePath = "/data/message-archive/";

export function messageArchiveLink(query = "") {
  const trimmed = query.trim();
  if (!trimmed) return "/messages";
  const params = new URLSearchParams({ q: trimmed });
  return `/messages?${params}`;
}

export async function loadMessageBatch(file: string, signal?: AbortSignal) {
  const response = await fetch(archivePath + file, { signal });
  if (!response.ok) throw new Error(`Could not load message archive (${response.status})`);
  // Hosts may serve the stored gzip bytes or decode them via Content-Encoding.
  const bytes = await response.arrayBuffer();
  const prefix = new Uint8Array(bytes, 0, 2);
  if (prefix[0] !== 0x1f || prefix[1] !== 0x8b) {
    return JSON.parse(new TextDecoder().decode(bytes)) as ArchivedMessage[];
  }
  const text = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return (await new Response(text).json()) as ArchivedMessage[];
}

const words = (text: string) => text.toLowerCase().replace(/[‘’']/g, "").match(/[\p{L}\p{N}]+/gu) ?? [];
const wordBoundaryBefore = "(?<![\\p{L}\\p{N}])";
const wordBoundaryAfter = "(?![\\p{L}\\p{N}])";
const wordSeparator = "[^\\p{L}\\p{N}]+";
const patternForWord = (word: string) => Array.from(word).join("[‘’']?");
const patternForPhrase = (terms: string[]) =>
  wordBoundaryBefore + terms.map(patternForWord).join(wordSeparator) + wordBoundaryAfter;

const commonWords = new Set([
  "a", "an", "and", "are", "about", "at", "be", "by", "did", "do", "does",
  "for", "from", "how", "in", "is", "of", "on", "or", "that", "the", "to",
  "was", "were", "what", "when", "where", "which", "with",
]);

const months = "january february march april may june july august september october november december".split(" ");

export function messageDateCode(query: string) {
  const input = query.trim().toLowerCase();
  const short = /^(\d{2})[-–— ]?(\d{4})([a-z]{0,2})$/.exec(input);
  if (short) return short.slice(1).join("");

  const iso = /^(19\d{2})-(\d{1,2})-(\d{1,2})$/.exec(input);
  if (iso) return iso[1].slice(-2) + iso[2].padStart(2, "0") + iso[3].padStart(2, "0");

  const monthFirst = /^([a-z]+) (\d{1,2})(?:st|nd|rd|th)?[,]? (19\d{2})$/.exec(input);
  const dayFirst = /^(\d{1,2})(?:st|nd|rd|th)? ([a-z]+)[,]? (19\d{2})$/.exec(input);
  const date = monthFirst ?? (dayFirst && [input, dayFirst[2], dayFirst[1], dayFirst[3]]);
  if (!date) return undefined;
  const month = months.findIndex((name) => name === date[1] || name.slice(0, 3) === date[1]) + 1;
  if (!month || Number(date[2]) < 1 || Number(date[2]) > 31) return undefined;
  return date[3].slice(-2) + String(month).padStart(2, "0") + date[2].padStart(2, "0");
}

export function filterMessageCatalog(catalog: MessageEntry[], query: string) {
  const terms = words(query);
  if (!terms.length) return query.trim() ? [] : catalog;
  const code = messageDateCode(query);
  const phrase = terms.join(" ");
  const quoted = /"[^"]+"|“[^”]+”/.test(query) ? compileQuery(query) : undefined;
  return catalog.flatMap((entry) => {
    const entryCode = entry.code.replace("-", "").toLowerCase();
    if (code) return entryCode.startsWith(code) ? [{ entry, rank: entryCode === code ? 0 : 1 }] : [];
    const title = words(entry.title);
    const titlePhrase = title.join(" ");
    if (titlePhrase === phrase) return [{ entry, rank: 0 }];
    if (` ${titlePhrase} `.includes(` ${phrase} `)) return [{ entry, rank: 1 }];
    if (quoted) return quoted.required.every((pattern) => pattern.test(entry.title)) ? [{ entry, rank: 2 }] : [];
    return terms.every((term) => title.some((word) => word.startsWith(term))) ? [{ entry, rank: 2 }] : [];
  }).sort((a, b) => a.rank - b.rank).map(({ entry }) => entry);
}

function compileQuery(query: string) {
  const terms = words(query);
  if (!terms.length) return undefined;
  const quoted = Array.from(query.matchAll(/"([^"]+)"|“([^”]+)”/g), (match) =>
    words(match[1] ?? match[2])).filter((phrase) => phrase.length > 0);
  const unquoted = words(query.replace(/"[^"]+"|“[^”]+”/g, " "));
  const meaningful = unquoted.filter((term) => !commonWords.has(term));
  const keywords = [...new Set(meaningful.length || quoted.length ? meaningful : unquoted)];
  return {
    phrase: new RegExp(patternForPhrase(terms), "iu"),
    required: [
      ...quoted.map((phrase) => new RegExp(patternForPhrase(phrase), "iu")),
      ...keywords.map((word) => new RegExp(patternForPhrase([word]), "iu")),
    ],
  };
}

export function highlightMessageText(text: string, query: string) {
  const terms = [...new Set(words(query))];
  const keywords = terms.filter((term) => !commonWords.has(term));
  if (!terms.length) return [{ text, match: false }];
  const alternatives = (keywords.length ? keywords : terms).map(patternForWord).join("|");
  const pattern = new RegExp(`${wordBoundaryBefore}(?:${alternatives})${wordBoundaryAfter}`, "giu");
  const fragments = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    fragments.push({ text: text.slice(end, match.index), match: false });
    fragments.push({ text: match[0], match: true });
    end = match.index + match[0].length;
  }
  fragments.push({ text: text.slice(end), match: false });
  return fragments;
}

export function findMessageMatches(messages: ArchivedMessage[], query: string): MessageMatch[] {
  const compiled = compileQuery(query);
  if (!compiled) return [];
  const results: MessageMatch[] = [];
  for (const [code, title, paragraphs] of messages) {
    for (const [paragraph, [number, text]] of paragraphs.entries()) {
      if (!text) continue;
      const exact = compiled.phrase.exec(text);
      let first = 0;
      let last = 0;
      let rank = 0;
      if (exact) {
        first = exact.index;
        last = first + exact[0].length;
      } else {
        const found: RegExpExecArray[] = [];
        for (const pattern of compiled.required) {
          const match = pattern.exec(text);
          if (!match) break;
          found.push(match);
        }
        if (found.length !== compiled.required.length || found.length === 0) continue;
        first = Math.min(...found.map((match) => match.index));
        last = Math.max(...found.map((match) => match.index + match[0].length));
        rank = 1 + last - first;
      }

      const start = Math.max(0, first - 55);
      const end = Math.min(text.length, Math.max(first + 125, Math.min(last + 45, first + 195)));
      results.push({
        code, title, paragraph, number, rank,
        excerpt: (start ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : ""),
      });
    }
  }
  return results.sort(compareMessageMatches);
}

export function compareMessageMatches(a: MessageMatch, b: MessageMatch) {
  return a.rank - b.rank || a.code.localeCompare(b.code) || a.paragraph - b.paragraph;
}

export function findTranscriptParagraphs(message: ArchivedMessage, query: string) {
  const number = /^(?:(?:paragraph|para\.?)\s+|¶\s*)?(\d+)$/i.exec(query.trim());
  if (!number) {
    return {
      query,
      matches: findMessageMatches([message], query),
    };
  }

  // The printed paragraph number can differ from its offset in the transcript.
  const [code, title, paragraphs] = message;
  const matches = paragraphs.flatMap(([label, text], paragraph): MessageMatch[] => {
    const printedNumber = label || String(paragraph + 1);
    if (Number(printedNumber) !== Number(number[1])) return [];
    const excerpt = text.length > 150 ? `${text.slice(0, 150).trimEnd()}…` : text;
    return [{ code, title, paragraph, number: printedNumber, excerpt, rank: 0 }];
  });
  return { query: "", matches };
}
