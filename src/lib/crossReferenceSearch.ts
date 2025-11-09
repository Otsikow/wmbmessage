import { parseVerseReference } from "@/lib/verseParser";

export interface CrossReferenceRecord {
  id?: string;
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  to_verse_end?: number;
  relationship_type?: string;
  notes?: string;
}

function normalizeBookName(book: string): string {
  return book.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function booksMatch(a: string, b: string): boolean {
  const normalizedA = normalizeBookName(a);
  const normalizedB = normalizeBookName(b);
  return (
    normalizedA === normalizedB ||
    normalizedA.includes(normalizedB) ||
    normalizedB.includes(normalizedA)
  );
}

function referenceMatches(ref: CrossReferenceRecord, query: ReturnType<typeof parseVerseReference>): boolean {
  if (!query) return false;

  const matchesFromBook = booksMatch(ref.from_book, query.book);
  const matchesToBook = booksMatch(ref.to_book, query.book);

  const matchesFromChapter = ref.from_chapter === query.chapter;
  const matchesToChapter = ref.to_chapter === query.chapter;

  const matchesFromVerse =
    query.startVerse === undefined ||
    ref.from_verse === query.startVerse ||
    (ref.from_verse <= query.startVerse &&
      typeof ref.to_verse_end === "number" &&
      query.startVerse <= ref.to_verse_end);

  const matchesToVerse =
    query.startVerse === undefined ||
    ref.to_verse === query.startVerse ||
    (typeof ref.to_verse_end === "number" &&
      query.startVerse >= ref.to_verse &&
      query.startVerse <= ref.to_verse_end);

  return (
    (matchesFromBook && matchesFromChapter && matchesFromVerse) ||
    (matchesToBook && matchesToChapter && matchesToVerse)
  );
}

function textMatches(ref: CrossReferenceRecord, query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  const possibleMatches = [
    ref.from_book,
    `${ref.from_book} ${ref.from_chapter}:${ref.from_verse}`,
    ref.to_book,
    `${ref.to_book} ${ref.to_chapter}:${ref.to_verse}`,
    ref.relationship_type,
    ref.notes,
  ];

  return possibleMatches.some((value) =>
    value?.toLowerCase().includes(normalizedQuery)
  );
}

export function searchCrossReferences(
  query: string,
  crossReferences: CrossReferenceRecord[]
): CrossReferenceRecord[] {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const parsedReference = parseVerseReference(trimmedQuery);

  if (parsedReference) {
    return crossReferences.filter((ref) =>
      referenceMatches(ref, parsedReference)
    );
  }

  return crossReferences.filter((ref) => textMatches(ref, trimmedQuery));
}

