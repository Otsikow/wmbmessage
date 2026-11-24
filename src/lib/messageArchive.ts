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
}

export const archivePath = "/data/message-archive/";

export function messageArchiveLink(query = "") {
  const trimmed = query.trim();
  if (!trimmed) return "/messages";
  const params = new URLSearchParams({ q: trimmed });
  if (!/^\d{2}-?\d{4}[a-z]?$/i.test(trimmed)) params.set("scope", "text");
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

export function filterMessageCatalog(catalog: MessageEntry[], query: string) {
  const trimmed = query.trim();
  const terms = words(trimmed);
  if (!terms.length) return catalog;
  const code = terms.join("");
  return catalog.filter((entry) =>
    entry.code.replace("-", "").toLowerCase().includes(code) ||
    terms.every((term) => words(entry.title).join(" ").includes(term)),
  );
}

export function findMessageMatches(messages: ArchivedMessage[], query: string): MessageMatch[] {
  const terms = words(query);
  if (!terms.length) return [];
  const termPattern = terms.map((term) => Array.from(term).join("[‘’']?")).join("[^\\p{L}\\p{N}]+");
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${termPattern}(?![\\p{L}\\p{N}])`, "iu");
  const results: MessageMatch[] = [];
  for (const [code, title, paragraphs] of messages) {
    for (const [paragraph, [number, text]] of paragraphs.entries()) {
      const match = pattern.exec(text);
      if (!match) continue;
      const start = Math.max(0, match.index - 72);
      const end = Math.min(text.length, match.index + match[0].length + 100);
      results.push({
        code, title, paragraph, number,
        excerpt: (start ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : ""),
      });
      break;
    }
  }
  return results;
}
