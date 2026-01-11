import { BIBLE_BOOKS } from "@/hooks/useBibleData";

export interface ParsedReference {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
}

export function parseVerseReference(reference: string): ParsedReference | null {
  // Clean up the reference
  const cleaned = reference.trim();
  
  // Match patterns like "John 3:16", "Genesis 1:1-3", "Romans 8:28"
  const pattern = /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?$/;
  const match = cleaned.match(pattern);
  
  if (!match) return null;
  
  const bookName = match[1].trim();
  let chapter = parseInt(match[2]);
  let startVerse = match[3] ? parseInt(match[3]) : undefined;
  let endVerse = match[4] ? parseInt(match[4]) : undefined;
  
  // Find the book (case-insensitive, partial match)
  const book = BIBLE_BOOKS.find(b => 
    b.name.toLowerCase().includes(bookName.toLowerCase()) ||
    bookName.toLowerCase().includes(b.name.toLowerCase())
  );
  
  if (!book) return null;

  if (!startVerse && !endVerse) {
    const chapterDigits = match[2];

    if (book.chapters === 1 && chapter > 1) {
      startVerse = chapter;
      chapter = 1;
    } else if (chapterDigits.length >= 3 && chapter > book.chapters) {
      const verseDigits = chapterDigits.slice(-2);
      const chapterDigitsPart = chapterDigits.slice(0, -2);
      const derivedChapter = parseInt(chapterDigitsPart);
      const derivedVerse = parseInt(verseDigits);

      if (derivedChapter >= 1 && derivedChapter <= book.chapters) {
        chapter = derivedChapter;
        startVerse = derivedVerse;
      }
    }
  }
  
  return {
    book: book.name,
    chapter,
    startVerse,
    endVerse
  };
}

export function formatReference(ref: ParsedReference): string {
  let formatted = `${ref.book} ${ref.chapter}`;
  if (ref.startVerse) {
    formatted += `:${ref.startVerse}`;
    if (ref.endVerse && ref.endVerse !== ref.startVerse) {
      formatted += `-${ref.endVerse}`;
    }
  }
  return formatted;
}
