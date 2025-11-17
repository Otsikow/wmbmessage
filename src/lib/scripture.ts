import { ScriptureRange } from "@/types/readingPlans";

export const formatScriptureRange = (range: ScriptureRange) => {
  const hasVerseRange = typeof range.verseStart === "number";
  const hasVerseEnd = typeof range.verseEnd === "number";

  if (hasVerseRange) {
    if (hasVerseEnd && range.verseEnd !== range.verseStart) {
      return `${range.book} ${range.chapterStart}:${range.verseStart}-${range.verseEnd}`;
    }
    return `${range.book} ${range.chapterStart}:${range.verseStart}`;
  }

  if (range.chapterStart === range.chapterEnd) {
    return `${range.book} ${range.chapterStart}`;
  }

  return `${range.book} ${range.chapterStart}-${range.chapterEnd}`;
};

export const getReaderLinkForRange = (range: ScriptureRange) => {
  const params = new URLSearchParams();
  params.set("book", range.book);
  params.set("chapter", String(range.chapterStart));

  if (typeof range.verseStart === "number") {
    params.set("verse", String(range.verseStart));
  }

  return `/bible?${params.toString()}`;
};
