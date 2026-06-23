import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { parseVerseReference } from "@/lib/verseParser";
import { BIBLE_BOOKS } from "@/hooks/useBibleData";

const BOOK_NAMES = BIBLE_BOOKS.map((b) => b.name).concat([
  "Psalm",
  "Revelations",
]);

// Sort by length desc so multi-word books (e.g. "Song of Solomon") match first
const SORTED_BOOKS = Array.from(new Set(BOOK_NAMES)).sort(
  (a, b) => b.length - a.length,
);

// Matches things like "John 3:16", "Genesis 1:1-3", "1 Corinthians 13",
// optionally followed by additional ",4" or ",5-6" verse lists.
const SCRIPTURE_INLINE_RE = new RegExp(
  `\\b(?:${SORTED_BOOKS.join("|")})\\s+\\d+(?::\\d+(?:\\s*[-–—]\\s*\\d+)?(?:\\s*,\\s*\\d+(?:\\s*[-–—]\\s*\\d+)?)*)?\\b`,
  "gi",
);

export function buildBibleHref(reference: string): string | null {
  const parsed = parseVerseReference(reference);
  if (!parsed) return null;
  const params = new URLSearchParams();
  params.set("book", parsed.book);
  params.set("chapter", String(parsed.chapter));
  if (parsed.startVerse) params.set("verse", String(parsed.startVerse));
  return `/bible?${params.toString()}`;
}

function highlightText(text: string, query?: string): ReactNode {
  if (!query || !query.trim()) return text;
  const re = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return text.split(re).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Linkify any inline Bible scripture references inside a text run.
 * Falls back to plain text (with optional highlight) when no refs are found.
 */
export function linkifyScriptures(text: string, query?: string): ReactNode {
  if (!text) return text;
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  // Reset regex state for global flag
  const re = new RegExp(SCRIPTURE_INLINE_RE.source, SCRIPTURE_INLINE_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const ref = m[0];
    const href = buildBibleHref(ref);
    if (start > lastIndex) {
      out.push(
        <span key={`t-${key++}`}>
          {highlightText(text.slice(lastIndex, start), query)}
        </span>,
      );
    }
    if (href) {
      out.push(
        <Link
          key={`r-${key++}`}
          to={href}
          className="text-primary font-medium underline decoration-primary/40 underline-offset-2 hover:decoration-primary hover:bg-primary/10 rounded px-0.5 transition-colors"
          title={`Read ${ref} in the Bible`}
        >
          {highlightText(ref, query)}
        </Link>,
      );
    } else {
      out.push(<span key={`r-${key++}`}>{highlightText(ref, query)}</span>);
    }
    lastIndex = start + ref.length;
  }
  if (lastIndex < text.length) {
    out.push(
      <span key={`t-${key++}`}>
        {highlightText(text.slice(lastIndex), query)}
      </span>,
    );
  }
  return <>{out}</>;
}

/**
 * Render a standalone scripture reference (used in the scripture callout box)
 * as a prominent button-like link to the Bible reader.
 */
export function ScriptureRefLink({
  reference,
  query,
  className,
}: {
  reference: string;
  query?: string;
  className?: string;
}) {
  const href = buildBibleHref(reference);
  const content = (
    <>
      <BookOpen className="h-4 w-4" />
      <span>{highlightText(reference, query)}</span>
    </>
  );
  if (!href) {
    return (
      <span
        className={
          className ??
          "inline-flex items-center gap-2 text-primary font-semibold"
        }
      >
        {content}
      </span>
    );
  }
  return (
    <Link
      to={href}
      className={
        className ??
        "inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-2"
      }
      title={`Read ${reference} in the Bible`}
    >
      {content}
    </Link>
  );
}
