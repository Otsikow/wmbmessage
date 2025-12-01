import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Link2,
  BookMarked,
  Search,
  Cog,
  Moon,
  Sun,
  Type,
  MoreHorizontal,
  Highlighter,
  Copy,
  BookmarkPlus,
  NotebookPen,
  X,
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { useHighlights } from "@/hooks/useHighlights";
import { cn } from "@/lib/utils";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import SermonCrossReferenceModal from "@/components/SermonCrossReferenceModal";
import VerseCard from "@/components/VerseCard";
import { useSettings } from "@/contexts/SettingsContext";
import { useScriptureFontOptions, type ScriptureFontId } from "@/hooks/useScriptureFontOptions";
import { NoteEditor } from "@/components/NoteEditor";
import { useUserNotes } from "@/hooks/useNotes";
import BackButton from "@/components/BackButton";
import { useEngagement } from "@/contexts/EngagementContext";
import HighlightMenu from "@/components/HighlightMenu";

const LAST_LOCATION_STORAGE_KEY = "reader:lastLocation";

export default function Reader() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { createUserNote } = useUserNotes();
  const { recordActivity } = useEngagement();
  const scriptureFontOptions = useScriptureFontOptions();

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
  const [selectedVerses, setSelectedVerses] = useState<number[]>(
    initialLocation.verse ? [initialLocation.verse] : []
  );
  const [focusedVerse, setFocusedVerse] = useState<number | undefined>(
    initialLocation.verse
  );

  const [showCrossRef, setShowCrossRef] = useState(false);
  const [showSermonCrossRef, setShowSermonCrossRef] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [showReadingSettings, setShowReadingSettings] = useState(false);
  const [noteVerseContext, setNoteVerseContext] = useState<string>("");
  const [textSelection, setTextSelection] = useState<string>("");
  const versesContainerRef = useRef<HTMLDivElement | null>(null);

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
    setSelectedVerses(verse ? [verse] : []);
    setFocusedVerse(verse);
  };

  const handleVerseSelect = (verseNumber: number) => {
    const selection = window.getSelection?.();
    selection?.removeAllRanges();
    setTextSelection("");

    setSelectedVerses((prev) => {
      const isSelected = prev.includes(verseNumber);
      if (isSelected) {
        return prev.filter((v) => v !== verseNumber);
      }
      return [...prev, verseNumber].sort((a, b) => a - b);
    });
    setFocusedVerse(verseNumber);
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
        verse: selectedVerses[0] ?? null,
      })
    );
  }, [currentBook, currentChapter, selectedVerses]);

  useEffect(() => {
    recordActivity("bible-reading", {
      description: `Read ${currentBook} ${currentChapter}`,
    });
  }, [currentBook, currentChapter, recordActivity]);

  const handleCrossReferenceClick = (verseNumber: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verseNumber)
        ? prev
        : [...prev, verseNumber].sort((a, b) => a - b)
    );
    setFocusedVerse(verseNumber);
    setShowCrossRef(true);
  };

  const handleSermonCrossRefClick = (verseNumber: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verseNumber)
        ? prev
        : [...prev, verseNumber].sort((a, b) => a - b)
    );
    setFocusedVerse(verseNumber);
    setShowSermonCrossRef(true);
  };

  const handleAddNote = (verseNumber: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const verseRef = `${currentBook} ${currentChapter}:${verseNumber}`;
    setNoteVerseContext(verseRef);
    setFocusedVerse(verseNumber);
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

  const handleBulkHighlight = async (color: string, note?: string) => {
    if (!selectedVerses.length) return;

    await Promise.all(selectedVerses.map((verse) => addHighlight(verse, color, note)));
  };

  const handleBulkRemoveHighlight = async () => {
    if (!selectedVerses.length) return;

    await Promise.all(selectedVerses.map((verse) => removeHighlight(verse)));
  };

  const handleBulkNote = () => {
    if (!selectedVerses.length) return;

    const references = selectedVerses
      .map((verse) => `${currentBook} ${currentChapter}:${verse}`)
      .join(", ");

    setNoteVerseContext(`Selected verses: ${references}`);
    setFocusedVerse(selectedVerses[0]);
    setIsNoteEditorOpen(true);
  };

  const handleSelectEntireChapter = () => {
    if (!verses.length) return;

    setSelectedVerses(verses.map((verse) => verse.number));
    setTextSelection("");
  };

  const handleClearSelection = () => {
    setSelectedVerses([]);
    setFocusedVerse(undefined);
    const selection = window.getSelection?.();
    selection?.removeAllRanges();
    setTextSelection("");
  };

  const handleCopySelection = async () => {
    const selectionText = textSelection.trim();

    const verseContent = selectedVerses
      .map((verseNumber) => {
        const verseData = verses.find((v) => v.number === verseNumber);

        if (!verseData) return "";

        return `${currentBook} ${currentChapter}:${verseData.number}\n${verseData.text}`;
      })
      .filter(Boolean)
      .join("\n\n");

    const contentToCopy = selectionText || verseContent;

    if (!contentToCopy) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contentToCopy);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = contentToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (error) {
      console.error("Failed to copy selection", error);
    }
  };

  const handleBulkBookmark = async () => {
    if (!selectedVerses.length) return;

    await Promise.all(selectedVerses.map((verseNumber) => toggleBookmark(verseNumber)));
  };

  const primarySelectedVerse = selectedVerses[0];

  const currentBookData = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

  const readerFontClass = cn("reader-typography");
  const selectedScriptureFont = scriptureFontOptions.find(
    (option) => option.id === settings.readerFontFamily
  );
  const controlButtonClass =
    "h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection?.();

      if (!selection || selection.isCollapsed) {
        setTextSelection("");
        return;
      }

      const selectedText = selection.toString().trim();
      const container = versesContainerRef.current;
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;

      if (!selectedText || !container || !anchorNode || !focusNode) {
        setTextSelection("");
        return;
      }

      const isWithinReader =
        container.contains(anchorNode) || container.contains(focusNode);

      setTextSelection(isWithinReader ? selectedText : "");
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const hasSelection = selectedVerses.length > 0 || Boolean(textSelection);
  const selectionLabel = selectedVerses.length
    ? `${selectedVerses.length} verse${selectedVerses.length === 1 ? "" : "s"} selected`
    : textSelection
      ? "Text selected"
      : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24 md:pb-12">
      {/* Top Navigation */}
      <div className="border-b border-border/70 bg-card/95 shadow-sm">
        <div className="container mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-2">
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
              <DropdownMenu>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={controlButtonClass}
                        aria-label="Quick actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Quick actions and shortcuts</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Shortcuts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setShowCrossRef(true)} className="gap-3 py-3">
                    <Link2 className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">Cross references</span>
                      <span className="text-xs text-muted-foreground">
                        Explore related passages and search
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setShowSermonCrossRef(true)}
                    className="gap-3 py-3"
                  >
                    <BookMarked className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">Sermon references</span>
                      <span className="text-xs text-muted-foreground">See related sermons</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => navigate("/search")}
                    className="gap-3 py-3"
                  >
                    <Search className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">Search the Bible</span>
                      <span className="text-xs text-muted-foreground">Jump to the search tool</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setShowReadingSettings(true)}
                    className="gap-3 py-3"
                  >
                    <Cog className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">Reading settings</span>
                      <span className="text-xs text-muted-foreground">Adjust fonts and theme</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Dialog open={showCrossRef} onOpenChange={setShowCrossRef}>
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
                      currentVerse={focusedVerse ?? primarySelectedVerse}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showReadingSettings} onOpenChange={setShowReadingSettings}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Reading settings</DialogTitle>
                    <DialogDescription>
                      Personalize your Bible reading experience.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm font-medium">Font size</Label>
                          <p className="text-xs text-muted-foreground">
                            Make verses easier to read with larger text.
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                          {settings.fontSize}px
                        </span>
                      </div>
                      <Slider
                        value={[settings.fontSize]}
                        min={14}
                        max={24}
                        step={1}
                        onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                      />
                      <div className="flex justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                        <span>Smaller</span>
                        <span>Larger</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm font-medium">Font style</Label>
                          <p className="text-xs text-muted-foreground">
                            Choose the typeface for scripture text.
                          </p>
                        </div>
                      </div>
                      <Select
                        value={settings.readerFontFamily}
                        onValueChange={(value: ScriptureFontId) =>
                          updateSettings({ readerFontFamily: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Choose a scripture font" />
                        </SelectTrigger>
                        <SelectContent>
                          {scriptureFontOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id} className="py-2">
                              <div className="flex flex-col gap-1 text-left">
                                <span className="text-sm font-semibold text-foreground">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                                <span
                                  className="text-sm text-foreground/80"
                                  style={{ fontFamily: option.stack }}
                                >
                                  {option.preview}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {settings.theme === "dark" ? (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1 space-y-1">
                          <Label className="text-sm font-medium">Dark mode</Label>
                          <p className="text-xs text-muted-foreground">
                            Reduce glare and make reading comfortable at night.
                          </p>
                        </div>
                        <Switch
                          checked={settings.theme === "dark"}
                          onCheckedChange={(checked) => updateSettings({ theme: checked ? "dark" : "light" })}
                          aria-label="Toggle dark mode"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
                      <div
                        className={cn("mt-3 text-sm sm:text-base leading-7", readerFontClass)}
                        style={{ fontFamily: selectedScriptureFont?.stack }}
                      >
                        In the beginning God created the heaven and the earth. (Genesis 1:1)
                      </div>
                      {selectedScriptureFont && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Using {selectedScriptureFont.label}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
            </Dialog>

            <div className="rounded-2xl border border-border/60 bg-background/90 p-3 shadow-sm sm:p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Book
                  </span>
                  <Select
                    value={currentBook}
                    onValueChange={(value) => {
                      setCurrentBook(value);
                      setCurrentChapter(1);
                      setSelectedVerses([]);
                      setFocusedVerse(undefined);
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
                <div className="flex flex-col gap-1 sm:w-auto">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                    Chapter
                  </span>
                  <Select
                    value={currentChapter.toString()}
                    onValueChange={(value) => {
                      setCurrentChapter(parseInt(value, 10));
                      setSelectedVerses([]);
                      setFocusedVerse(undefined);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full min-w-[140px] rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground shadow-sm transition focus:ring-2 focus:ring-primary/30 sm:h-12 sm:w-[140px] sm:text-base md:w-[160px]">
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
              <div className="space-y-5 sm:space-y-6">
                <div
                  ref={versesContainerRef}
                  className={cn("space-y-4 sm:space-y-5 max-w-4xl mx-auto", readerFontClass)}
                >
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
                      isSelected={selectedVerses.includes(verse.number)}
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
              </div>
            )}

            {/* Chapter Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-8 border-t border-border/70 max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentChapter(Math.max(1, currentChapter - 1));
                  setSelectedVerses([]);
                  setFocusedVerse(undefined);
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
                  setSelectedVerses([]);
                  setFocusedVerse(undefined);
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

      {/* Selection Actions */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-4 z-30 transition-all duration-200", 
          hasSelection ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
        aria-hidden={!hasSelection}
      >
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Highlighter className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-foreground">Bulk actions</span>
                <span className="text-xs text-muted-foreground">{selectionLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <HighlightMenu
                onHighlight={(color, note) => handleBulkHighlight(color, note)}
                onRemoveHighlight={selectedVerses.length ? handleBulkRemoveHighlight : undefined}
                disabled={!selectedVerses.length}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleBulkNote}
                disabled={!selectedVerses.length}
              >
                <NotebookPen className="h-4 w-4" />
                Add note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleBulkBookmark}
                disabled={!selectedVerses.length}
              >
                <BookmarkPlus className="h-4 w-4" />
                Bookmark
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopySelection}
                disabled={!hasSelection}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleClearSelection}
                disabled={!hasSelection}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sermon Cross References Modal */}
      <SermonCrossReferenceModal
        open={showSermonCrossRef}
        onOpenChange={setShowSermonCrossRef}
        book={currentBook}
        chapter={currentChapter}
        verse={focusedVerse ?? primarySelectedVerse}
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
