import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Link2, BookMarked, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { useHighlights } from "@/hooks/useHighlights";
import { cn } from "@/lib/utils";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import SermonCrossReferenceModal from "@/components/SermonCrossReferenceModal";
import VerseCard from "@/components/VerseCard";
import { useSettings } from "@/contexts/SettingsContext";
import { NoteEditor } from "@/components/NoteEditor";
import { useUserNotes } from "@/hooks/useNotes";
import BackButton from "@/components/BackButton";
import { useEngagement } from "@/contexts/EngagementContext";

const LAST_LOCATION_STORAGE_KEY = "reader:lastLocation";

export default function Reader() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createUserNote } = useUserNotes();
  const { recordActivity } = useEngagement();

  const searchParams = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
  }, []);

  const initialLocation = useMemo(() => {
    const availableBooks = new Set(BIBLE_BOOKS.map((b) => b.name));

    const getValidChapter = (book: string, chapter: number) => {
      const bookData = BIBLE_BOOKS.find((b) => b.name === book);
      if (!bookData) {
        return 1;
      }

      if (Number.isNaN(chapter) || chapter < 1) {
        return 1;
      }

      return Math.min(chapter, bookData.chapters);
    };

    const parseVerse = (value: string | null) => {
      if (!value) {
        return undefined;
      }

      const verseNumber = parseInt(value, 10);

      if (Number.isNaN(verseNumber) || verseNumber <= 0) {
        return undefined;
      }

      return verseNumber;
    };

    const bookParam = searchParams.get("book");
    const chapterParam = searchParams.get("chapter");
    const verseFromParams = parseVerse(searchParams.get("verse"));

    if (bookParam && availableBooks.has(bookParam) && chapterParam) {
      const chapterNumber = parseInt(chapterParam, 10);

      if (!Number.isNaN(chapterNumber)) {
        return {
          book: bookParam,
          chapter: getValidChapter(bookParam, chapterNumber),
          verse: verseFromParams,
        };
      }
    }

    if (typeof window !== "undefined") {
      const storedLocation = window.localStorage.getItem(LAST_LOCATION_STORAGE_KEY);

      if (storedLocation) {
        try {
          const parsed = JSON.parse(storedLocation) as {
            book?: string;
            chapter?: number;
            verse?: number | null;
          };

          if (
            parsed.book &&
            availableBooks.has(parsed.book) &&
            typeof parsed.chapter === "number" &&
            !Number.isNaN(parsed.chapter)
          ) {
            return {
              book: parsed.book,
              chapter: getValidChapter(parsed.book, parsed.chapter),
              verse:
                typeof parsed.verse === "number" &&
                !Number.isNaN(parsed.verse) &&
                parsed.verse > 0
                  ? parsed.verse
                  : undefined,
            };
          }
        } catch (error) {
          console.warn("Failed to parse stored reader location", error);
        }
      }
    }

    return {
      book: "Genesis",
      chapter: 1,
      verse: undefined,
    };
  }, [searchParams]);

  const [currentBook, setCurrentBook] = useState(initialLocation.book);
  const [currentChapter, setCurrentChapter] = useState(initialLocation.chapter);
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>(
    initialLocation.verse
  );

  const [showCrossRef, setShowCrossRef] = useState(false);
  const [showSermonCrossRef, setShowSermonCrossRef] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteVerseContext, setNoteVerseContext] = useState<string>("");

  const { verses, loading, error } = useBibleData(currentBook, currentChapter);

  const {
    addHighlight,
    removeHighlight,
    toggleBookmark,
    getVerseHighlight,
    isVerseBookmarked,
  } = useHighlights(currentBook, currentChapter);

  const handleNavigateFromCrossRef = (book: string, chapter: number, verse?: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setShowCrossRef(false);
    setSelectedVerse(verse);
  };

  const handleVerseSelect = (verseNumber: number) => {
    setSelectedVerse(verseNumber);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      LAST_LOCATION_STORAGE_KEY,
      JSON.stringify({
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerse ?? null,
      })
    );
  }, [currentBook, currentChapter, selectedVerse]);

  useEffect(() => {
    recordActivity("bible-reading", {
      description: `Read ${currentBook} ${currentChapter}`,
    });
  }, [currentBook, currentChapter, recordActivity]);

  const handleCrossReferenceClick = (verseNumber: number) => {
    setSelectedVerse(verseNumber);
    setShowCrossRef(true);
  };

  const handleSermonCrossRefClick = (verseNumber: number) => {
    setSelectedVerse(verseNumber);
    setShowSermonCrossRef(true);
  };

  const handleAddNote = (verseNumber: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const verseRef = `${currentBook} ${currentChapter}:${verseNumber}`;
    setNoteVerseContext(verseRef);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = async (noteData: {
    source_type: "bible" | "sermon";
    source_id: string;
    content: string;
    title?: string;
    verse_reference?: string | null;
  }) => {
    await createUserNote({
      ...noteData,
      title: noteData.title || noteVerseContext || "New study note",
    });
    recordActivity("note-created", {
      description: noteVerseContext || "New study note",
    });
    setIsNoteEditorOpen(false);
    setNoteVerseContext("");
  };

  const handleHighlight = async (verseNumber: number, color: string, note?: string) => {
    await addHighlight(verseNumber, color, note);
  };

  const handleRemoveHighlight = async (verseNumber: number) => {
    await removeHighlight(verseNumber);
  };

  const handleToggleBookmark = async (verseNumber: number) => {
    await toggleBookmark(verseNumber);
  };

  const currentBookData = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

  const readerFontClass = cn(
    "reader-typography",
    settings.readerFontFamily === "serif"
      ? "font-serif"
      : settings.readerFontFamily === "monospace"
      ? "font-mono"
      : "font-sans"
  );
  const controlButtonClass =
    "h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24 md:pb-12">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b border-border/70 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="container mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <BackButton aria-label="Go back to home" className={controlButtonClass} />
                <div className="hidden min-w-0 sm:flex flex-col">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
                    Bible Reader
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Navigate scripture, notes, and sermon references
                  </span>
                </div>
                <div className="flex flex-col min-w-0 sm:hidden">
                  <span className="text-sm font-medium text-foreground">
                    {currentBook} {currentChapter}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Tap to change book or chapter
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 sm:justify-end">
                {/* Cross Reference Button */}
                <Dialog open={showCrossRef} onOpenChange={setShowCrossRef}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={controlButtonClass}
                          aria-label="View cross references"
                        >
                          <Link2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          <span className="sr-only">Open cross references</span>
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>Cross references &amp; search</TooltipContent>
                  </Tooltip>
                  <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
                    <DialogHeader>
                      <DialogTitle>Cross References &amp; Search</DialogTitle>
                      <DialogDescription>
                        Search for keywords or look up verse references
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                      <CrossReferenceViewer
                        onNavigate={handleNavigateFromCrossRef}
                        currentBook={currentBook}
                        currentChapter={currentChapter}
                        currentVerse={selectedVerse}
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Sermon Cross Reference Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={controlButtonClass}
                      title="Sermon Cross References"
                      aria-label="View sermon references"
                      onClick={() => setShowSermonCrossRef(true)}
                    >
                      <BookMarked className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                      <span className="sr-only">View sermon cross references</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>Sermon references</TooltipContent>
                </Tooltip>

                {/* Search Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/search")}
                      className={controlButtonClass}
                      title="Search"
                      aria-label="Search Bible"
                    >
                      <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                      <span className="sr-only">Open search</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>Search the Bible</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/90 p-3 shadow-sm sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Book
                  </span>
                  <Select
                    value={currentBook}
                    onValueChange={(value) => {
                      setCurrentBook(value);
                      setCurrentChapter(1);
                      setSelectedVerse(undefined);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition focus:ring-2 focus:ring-primary/30 sm:h-12 sm:text-base">
                      <SelectValue placeholder="Select book" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Old Testament
                      </div>
                      {BIBLE_BOOKS.filter((b) => b.testament === "old").map((book) => (
                        <SelectItem key={book.name} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                      <div className="mt-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        New Testament
                      </div>
                      {BIBLE_BOOKS.filter((b) => b.testament === "new").map((book) => (
                        <SelectItem key={book.name} value={book.name}>
                          {book.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 sm:justify-self-end">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Chapter
                  </span>
                  <Select
                    value={currentChapter.toString()}
                    onValueChange={(value) => {
                      setCurrentChapter(parseInt(value, 10));
                      setSelectedVerse(undefined);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full min-w-0 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition focus:ring-2 focus:ring-primary/30 sm:h-12 sm:w-[140px] sm:text-base md:w-[160px]">
                      <SelectValue placeholder="Chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {Array.from({ length: maxChapter }, (_, i) => i + 1).map((chapter) => (
                        <SelectItem key={chapter} value={chapter.toString()}>
                          Chapter {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bible Content */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <Card className="border border-border/60 bg-card/95 shadow-xl">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">Holy Bible • King James Version</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                {currentBook} {currentChapter}
              </h1>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : (
              <div className={cn("space-y-4 sm:space-y-5 max-w-4xl mx-auto", readerFontClass)}>
                {verses.map((verse) => (
                  <VerseCard
                    key={verse.number}
                    book={currentBook}
                    chapter={currentChapter}
                    verse={verse}
                    highlight={
                      getVerseHighlight(verse.number)
                        ? {
                            color: getVerseHighlight(verse.number)!.color,
                            note: getVerseHighlight(verse.number)!.note,
                          }
                        : undefined
                    }
                    isBookmarked={isVerseBookmarked(verse.number)}
                    isSelected={selectedVerse === verse.number}
                    onHighlight={handleHighlight}
                    onRemoveHighlight={handleRemoveHighlight}
                    onToggleBookmark={handleToggleBookmark}
                    onViewCrossReferences={handleCrossReferenceClick}
                    onSelect={handleVerseSelect}
                    onAddNote={handleAddNote}
                    onSermonCrossRef={handleSermonCrossRefClick}
                    fontClass={readerFontClass}
                  />
                ))}
              </div>
            )}

            {/* Chapter Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-8 border-t border-border/70 max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(Math.max(1, currentChapter - 1));
                  setSelectedVerse(undefined);
                }}
                disabled={currentChapter <= 1}
                className="w-full sm:w-auto justify-center sm:justify-start"
                size="lg"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Previous Chapter</span>
                <span className="xs:hidden">Previous</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(Math.min(maxChapter, currentChapter + 1));
                  setSelectedVerse(undefined);
                }}
                disabled={currentChapter >= maxChapter}
                className="w-full sm:w-auto justify-center sm:justify-end"
                size="lg"
              >
                <span className="hidden xs:inline">Next Chapter</span>
                <span className="xs:hidden">Next</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sermon Cross References Modal */}
      <SermonCrossReferenceModal
        open={showSermonCrossRef}
        onOpenChange={setShowSermonCrossRef}
        book={currentBook}
        chapter={currentChapter}
        verse={selectedVerse}
      />

      {/* Note Editor */}
      <NoteEditor
        open={isNoteEditorOpen}
        onOpenChange={setIsNoteEditorOpen}
        onSave={handleSaveNote}
        sourceType="bible"
        sourceId={noteVerseContext}
      />
    </div>
  );
}
