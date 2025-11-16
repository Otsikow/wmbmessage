//// SECTION 1 — IMPORTS & CONSTANTS

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Link2,
  BookMarked,
  Search,
} from "lucide-react";

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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { useHighlights } from "@/hooks/useHighlights";
import { useSettings } from "@/contexts/SettingsContext";
import { NoteEditor } from "@/components/NoteEditor";
import { useUserNotes } from "@/hooks/useNotes";
import { useEngagement } from "@/contexts/EngagementContext";

import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import SermonCrossReferenceModal from "@/components/SermonCrossReferenceModal";
import VerseCard from "@/components/VerseCard";
import BackButton from "@/components/BackButton";

import { cn } from "@/lib/utils";

const LAST_LOCATION_STORAGE_KEY = "reader:lastLocation";
//// SECTION 2 — STATE, EFFECTS, HANDLERS

export default function Reader() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createUserNote } = useUserNotes();
  const { recordActivity } = useEngagement();

  // Parse query parameters
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  // Validate chapter
  const getValidChapter = (book: string, chapter: number) => {
    const bookData = BIBLE_BOOKS.find((b) => b.name === book);
    if (!bookData) return 1;
    if (Number.isNaN(chapter) || chapter < 1) return 1;
    return Math.min(chapter, bookData.chapters);
  };

  // Parse initial location (URL → localStorage → default Genesis 1)
  const initialLocation = useMemo(() => {
    const availableBooks = new Set(BIBLE_BOOKS.map((b) => b.name));

    const parseVerse = (v: string | null) => {
      if (!v) return undefined;
      const num = parseInt(v, 10);
      return Number.isNaN(num) || num <= 0 ? undefined : num;
    };

    const bookParam = searchParams.get("book");
    const chapterParam = searchParams.get("chapter");
    const verseParam = parseVerse(searchParams.get("verse"));

    // URL parameters
    if (bookParam && chapterParam && availableBooks.has(bookParam)) {
      const chapter = parseInt(chapterParam, 10);
      if (!Number.isNaN(chapter)) {
        return {
          book: bookParam,
          chapter: getValidChapter(bookParam, chapter),
          verse: verseParam,
        };
      }
    }

    // LocalStorage fallback
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(LAST_LOCATION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (
            parsed.book &&
            availableBooks.has(parsed.book) &&
            typeof parsed.chapter === "number"
          ) {
            return {
              book: parsed.book,
              chapter: getValidChapter(parsed.book, parsed.chapter),
              verse:
                typeof parsed.verse === "number" && parsed.verse > 0
                  ? parsed.verse
                  : undefined,
            };
          }
        } catch {
          console.warn("Failed to parse stored reader location.");
        }
      }
    }

    // Default
    return { book: "Genesis", chapter: 1, verse: undefined };
  }, [searchParams]);

  // Core Reader State
  const [currentBook, setCurrentBook] = useState(initialLocation.book);
  const [currentChapter, setCurrentChapter] = useState(initialLocation.chapter);
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>(
    initialLocation.verse
  );

  const [showCrossRef, setShowCrossRef] = useState(false);
  const [showSermonCrossRef, setShowSermonCrossRef] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteVerseContext, setNoteVerseContext] = useState("");

  // Load Bible data
  const { verses, loading, error } = useBibleData(currentBook, currentChapter);

  // Highlights & bookmarks
  const {
    addHighlight,
    removeHighlight,
    toggleBookmark,
    getVerseHighlight,
    isVerseBookmarked,
  } = useHighlights(currentBook, currentChapter);

  // Save reading position
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      LAST_LOCATION_STORAGE_KEY,
      JSON.stringify({
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerse ?? null,
      })
    );
  }, [currentBook, currentChapter, selectedVerse]);

  // Engagement tracking (streaks etc.)
  useEffect(() => {
    recordActivity("bible-reading", {
      description: `Read ${currentBook} ${currentChapter}`,
    });
  }, [currentBook, currentChapter, recordActivity]);

  // Scroll collapse logic — OPTION C
  const [isReaderHeaderCollapsed, setIsReaderHeaderCollapsed] = useState(false);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const current = window.scrollY;

      const scrollingDown = current > lastScrollPosition.current;
      const scrollingUp = current < lastScrollPosition.current - 10;

      // Expand when at the top
      if (current <= 60) {
        setIsReaderHeaderCollapsed(false);
      }

      // Collapse on scroll down
      else if (scrollingDown && current > 140) {
        setIsReaderHeaderCollapsed(true);
      }

      // Expand on scroll up
      else if (scrollingUp) {
        setIsReaderHeaderCollapsed(false);
      }

      lastScrollPosition.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handlers
  const handleVerseSelect = (n: number) => setSelectedVerse(n);

  const handleCrossReferenceClick = (n: number) => {
    setSelectedVerse(n);
    setShowCrossRef(true);
  };

  const handleSermonCrossRefClick = (n: number) => {
    setSelectedVerse(n);
    setShowSermonCrossRef(true);
  };

  const handleAddNote = (
    verseNumber: number,
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    const ref = `${currentBook} ${currentChapter}:${verseNumber}`;
    setNoteVerseContext(ref);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = async (data: {
    source_type: "bible" | "sermon";
    source_id: string;
    content: string;
    title?: string;
    verse_reference?: string | null;
  }) => {
    await createUserNote({
      ...data,
      title: data.title || noteVerseContext || "New study note",
    });

    recordActivity("note-created", {
      description: noteVerseContext || "New study note",
    });

    setIsNoteEditorOpen(false);
    setNoteVerseContext("");
  };

  const handleHighlight = async (n: number, color: string, note?: string) => {
    await addHighlight(n, color, note);
  };

  const handleRemoveHighlight = async (n: number) =>
    await removeHighlight(n);

  const handleToggleBookmark = async (n: number) =>
    await toggleBookmark(n);

  const currentBookData = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

  // Typography class
  const readerFontClass = cn(
    "reader-typography",
    settings.readerFontFamily === "serif"
      ? "font-serif"
      : settings.readerFontFamily === "monospace"
      ? "font-mono"
      : "font-sans"
  );

  // Floating control button styling
  const controlButtonClass =
    "h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
}
//// SECTION 3 — HEADER (OPTION C COLLAPSE)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24 md:pb-12">

      {/* ────────────────────────────────
          TOP NAVIGATION (COLLAPSIBLE)
      ───────────────────────────────── */}
      <div
        data-reader-header
        data-state={isReaderHeaderCollapsed ? "collapsed" : "expanded"}
        className={cn(
          "sticky top-0 z-30 w-full overflow-hidden backdrop-blur bg-background/70 supports-[backdrop-filter]:bg-background/70",
          "transition-[max-height,opacity] duration-300 ease-in-out",
          isReaderHeaderCollapsed
            ? "max-h-[70px] opacity-100"
            : "max-h-[420px] opacity-100"
        )}
      >
        <div className="border-b border-border/70 bg-card/95 shadow-sm">
          <div className="container mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-4">

            {/* If collapsed → show only top controls */}
            {isReaderHeaderCollapsed ? (
              <div className="flex items-center justify-between">
                <BackButton className={controlButtonClass} />

                <div className="flex items-center gap-2">

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
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Cross References</TooltipContent>
                    </Tooltip>
                  </Dialog>

                  {/* Sermon Cross Reference Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={controlButtonClass}
                        aria-label="Sermon references"
                        onClick={() => setShowSermonCrossRef(true)}
                      >
                        <BookMarked className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sermon References</TooltipContent>
                  </Tooltip>

                  {/* Search */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={controlButtonClass}
                        onClick={() => navigate("/search")}
                        aria-label="Search Bible"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Search</TooltipContent>
                  </Tooltip>

                </div>
              </div>
            ) : (
              /* ────────────────────────────────
                 FULL HEADER WHEN NOT COLLAPSED
                 ──────────────────────────────── */
              <div className="flex flex-col gap-3 sm:gap-4">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <BackButton className={controlButtonClass} />

                    <div className="hidden min-w-0 sm:flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
                        Bible Reader
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Navigate scripture, notes & cross references
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

                  <div className="flex items-center gap-2 sm:justify-end">

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
                              <Link2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Cross References</TooltipContent>
                      </Tooltip>

                      {/* MAIN VERSION (B) — Redesigned Modal */}
                      <DialogContent className="flex h-[90vh] max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-0 shadow-2xl">
                        <DialogHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/5 to-transparent px-6 pt-6 pb-4">
                          <DialogTitle className="text-xl font-semibold">
                            Cross References & Search
                          </DialogTitle>
                          <DialogDescription className="text-sm text-muted-foreground">
                            Search for keywords or look up verse references
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden px-6 py-4">
                          <CrossReferenceViewer
                            onNavigate={(book, chapter, verse) => {
                              setCurrentBook(book);
                              setCurrentChapter(chapter);
                              setSelectedVerse(verse);
                              setShowCrossRef(false);
                            }}
                            currentBook={currentBook}
                            currentChapter={currentChapter}
                            currentVerse={selectedVerse}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Sermon Cross Reference Button — ONLY ONCE */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={controlButtonClass}
                          aria-label="Sermon references"
                          onClick={() => setShowSermonCrossRef(true)}
                        >
                          <BookMarked className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sermon References</TooltipContent>
                    </Tooltip>

                    {/* Search Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate("/search")}
                          className={controlButtonClass}
                          aria-label="Search Bible"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Search</TooltipContent>
                    </Tooltip>

                  </div>
                </div>

                {/* Book + Chapter Selectors */}
                <div className="rounded-2xl border border-border/60 bg-background/90 p-3 shadow-sm sm:p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">

                    <div className="flex min-w-0 flex-col gap-1 flex-1">
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
                        <SelectTrigger className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-sm shadow-sm">
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>

                        <SelectContent className="max-h-[400px]">
                          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Old Testament
                          </div>

                          {BIBLE_BOOKS.filter((b) => b.testament === "old").map(
                            (book) => (
                              <SelectItem key={book.name} value={book.name}>
                                {book.name}
                              </SelectItem>
                            )
                          )}

                          <div className="mt-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            New Testament
                          </div>

                          {BIBLE_BOOKS.filter((b) => b.testament === "new").map(
                            (book) => (
                              <SelectItem key={book.name} value={book.name}>
                                {book.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
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
                        <SelectTrigger className="h-11 w-[140px] rounded-xl border border-border/60 bg-background px-4 text-sm shadow-sm">
                          <SelectValue placeholder="Chapter" />
                        </SelectTrigger>

                        <SelectContent className="max-h-[400px]">
                          {Array.from(
                            { length: maxChapter },
                            (_, idx) => idx + 1
                          ).map((chapter) => (
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
            )}

          </div>
        </div>
      </div>
//// SECTION 4 — BIBLE CONTENT (VERSES + LOADING STATES)

      {/* ────────────────────────────────
          MAIN BIBLE CONTENT AREA
      ───────────────────────────────── */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <Card className="border border-border/60 bg-card/95 shadow-xl">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 space-y-8">

            {/* Title */}
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
                Holy Bible • King James Version
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                {currentBook} {currentChapter}
              </h1>
            </div>

            {/* Loading / Error / Verse List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : (
              <div
                className={cn(
                  "space-y-4 sm:space-y-5 max-w-4xl mx-auto",
                  readerFontClass
                )}
              >
                {verses.map((verse) => (
                  <VerseCard
                    key={verse.number}
                    book={currentBook}
                    chapter={currentChapter}
                    verse={verse}
                    isSelected={selectedVerse === verse.number}
                    isBookmarked={isVerseBookmarked(verse.number)}
                    highlight={
                      getVerseHighlight(verse.number)
                        ? {
                            color: getVerseHighlight(verse.number)!.color,
                            note: getVerseHighlight(verse.number)!.note,
                          }
                        : undefined
                    }
                    onSelect={handleVerseSelect}
                    onViewCrossReferences={handleCrossReferenceClick}
                    onSermonCrossRef={handleSermonCrossRefClick}
                    onHighlight={handleHighlight}
                    onRemoveHighlight={handleRemoveHighlight}
                    onToggleBookmark={handleToggleBookmark}
                    onAddNote={handleAddNote}
                    fontClass={readerFontClass}
                  />
                ))}
              </div>
            )}
//// SECTION 5 — CHAPTER NAVIGATION

            {/* ────────────────────────────────
                CHAPTER NAVIGATION
            ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-8 border-t border-border/70 max-w-4xl mx-auto">

              {/* Previous Chapter */}
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(Math.max(1, currentChapter - 1));
                  setSelectedVerse(undefined);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentChapter <= 1}
                className="w-full sm:w-auto justify-center sm:justify-start"
                size="lg"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Previous Chapter</span>
                <span className="xs:hidden">Previous</span>
              </Button>

              {/* Next Chapter */}
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(Math.min(maxChapter, currentChapter + 1));
                  setSelectedVerse(undefined);
                  window.scrollTo({ top: 0, behavior: "smooth" });
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
//// SECTION 6 — SERMON CROSS-REFERENCE MODAL

      {/* ────────────────────────────────
          SERMON CROSS-REFERENCE MODAL
      ───────────────────────────────── */}
      <SermonCrossReferenceModal
        open={showSermonCrossRef}
        onOpenChange={setShowSermonCrossRef}
        book={currentBook}
        chapter={currentChapter}
        verse={selectedVerse}
      />
//// SECTION 7 — NOTE EDITOR

      {/* ────────────────────────────────
          NOTE EDITOR MODAL
      ───────────────────────────────── */}
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
//// SECTION 8 — END OF FILE
// Reader component fully loaded and exported successfully.
// No further code required below this line.
