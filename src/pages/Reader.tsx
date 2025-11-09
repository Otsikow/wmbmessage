import { useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { useHighlights } from "@/hooks/useHighlights";
import { cn } from "@/lib/utils";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import SermonCrossReferenceModal from "@/components/SermonCrossReferenceModal";
import VerseCard from "@/components/VerseCard";
import { useSettings } from "@/contexts/SettingsContext";
import { NoteEditor } from "@/components/NoteEditor";
import { useUserNotes } from "@/hooks/useNotes";

export default function Reader() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createUserNote } = useUserNotes();

  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [currentBook, setCurrentBook] = useState(searchParams.get("book") || "Genesis");
  const [currentChapter, setCurrentChapter] = useState(
    parseInt(searchParams.get("chapter") || "1")
  );

  const [showCrossRef, setShowCrossRef] = useState(false);
  const [showSermonCrossRef, setShowSermonCrossRef] = useState(false);
  const initialVerseParam = searchParams.get("verse");
  const initialVerseNumber = initialVerseParam ? parseInt(initialVerseParam, 10) : undefined;
  const [selectedVerse, setSelectedVerse] = useState<number | undefined>(
    initialVerseNumber !== undefined && !Number.isNaN(initialVerseNumber)
      ? initialVerseNumber
      : undefined
  );
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
    tags: string[];
  }) => {
    await createUserNote(noteData);
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

  const readerFontClass =
    settings.readerFontFamily === "serif"
      ? "font-serif"
      : settings.readerFontFamily === "monospace"
      ? "font-mono"
      : "font-sans";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24 md:pb-12">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-border/70 shadow-sm">
        <div className="container flex items-center justify-between gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="md:hidden shrink-0"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Select
              value={currentBook}
              onValueChange={(value) => {
                setCurrentBook(value);
                setCurrentChapter(1);
              }}
            >
              <SelectTrigger className="w-[100px] sm:w-[130px] md:w-[160px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Old Testament
                </div>
                {BIBLE_BOOKS.filter((b) => b.testament === "old").map((book) => (
                  <SelectItem key={book.name} value={book.name}>
                    {book.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  New Testament
                </div>
                {BIBLE_BOOKS.filter((b) => b.testament === "new").map((book) => (
                  <SelectItem key={book.name} value={book.name}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentChapter.toString()}
              onValueChange={(value) => setCurrentChapter(parseInt(value))}
            >
              <SelectTrigger className="w-[80px] sm:w-[100px] shrink-0">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {Array.from({ length: maxChapter }, (_, i) => i + 1).map((chapter) => (
                  <SelectItem key={chapter} value={chapter.toString()}>
                    Ch {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Cross Reference Button */}
            <Dialog open={showCrossRef} onOpenChange={setShowCrossRef}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Cross References"
                  aria-label="View Cross References"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Cross References & Search</DialogTitle>
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
            <Button
              variant="ghost"
              size="icon"
              title="Sermon Cross References"
              aria-label="View Sermon References"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setShowSermonCrossRef(true)}
            >
              <BookMarked className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/search")}
              title="Search"
              aria-label="Search Bible"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
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
                onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
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
                onClick={() => setCurrentChapter(Math.min(maxChapter, currentChapter + 1))}
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
        initialData={{
          source_type: "bible",
          source_id: noteVerseContext,
          content: "",
          tags: ["Bible"],
        }}
      />
    </div>
  );
}
