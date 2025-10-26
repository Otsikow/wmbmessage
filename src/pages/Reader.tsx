import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Settings, Search, ArrowLeft, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { cn } from "@/lib/utils";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import { useSettings } from "@/contexts/SettingsContext";

export default function Reader() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [currentBook, setCurrentBook] = useState(searchParams.get("book") || "Genesis");
  const [currentChapter, setCurrentChapter] = useState(parseInt(searchParams.get("chapter") || "1"));
  const [showCrossRef, setShowCrossRef] = useState(false);

  const handleNavigateFromCrossRef = (book: string, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setShowCrossRef(false);
  };

  const { verses, loading, error } = useBibleData(currentBook, currentChapter);
  
  const currentBookData = BIBLE_BOOKS.find(b => b.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

  const readerFontClass = 
    settings.readerFontFamily === "serif" ? "font-serif" :
    settings.readerFontFamily === "monospace" ? "font-mono" : "font-sans";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="md:hidden shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Select value={currentBook} onValueChange={(value) => {
              setCurrentBook(value);
              setCurrentChapter(1);
            }}>
              <SelectTrigger className="w-[100px] sm:w-[130px] md:w-[160px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Old Testament
                </div>
                {BIBLE_BOOKS.filter(b => b.testament === "old").map((book) => (
                  <SelectItem key={book.name} value={book.name}>
                    {book.name}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                  New Testament
                </div>
                {BIBLE_BOOKS.filter(b => b.testament === "new").map((book) => (
                  <SelectItem key={book.name} value={book.name}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentChapter.toString()} onValueChange={(value) => setCurrentChapter(parseInt(value))}>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
              disabled={currentChapter <= 1}
              className="h-8 w-8 sm:h-9 sm:w-9"
              title="Previous Chapter"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(Math.min(maxChapter, currentChapter + 1))}
              disabled={currentChapter >= maxChapter}
              className="h-8 w-8 sm:h-9 sm:w-9"
              title="Next Chapter"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Dialog open={showCrossRef} onOpenChange={setShowCrossRef}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Cross References" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cross References</DialogTitle>
                  <DialogDescription>
                    Look up and compare verses from different parts of the Bible
                  </DialogDescription>
                </DialogHeader>
                <CrossReferenceViewer onNavigate={handleNavigateFromCrossRef} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => navigate("/search")} title="Search" className="h-8 w-8 sm:h-9 sm:w-9">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bible Content */}
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Card className="border border-border/50 shadow-sm">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
            {currentBook} {currentChapter}
          </h1>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                {error}
              </div>
            ) : (
              <div className={cn("space-y-3 sm:space-y-4 max-w-4xl mx-auto", readerFontClass)}>
                {verses.map((verse) => (
                  <div
                    key={verse.number}
                    className="group flex gap-2 sm:gap-3 hover:bg-muted/50 rounded-lg p-2 sm:p-3 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-primary min-w-[1.5rem] sm:min-w-[2rem] text-right">
                      {verse.number}
                    </span>
                    <p className={cn(
                      "text-sm sm:text-base leading-relaxed",
                      verse.isJesusWords && "text-jesus-words font-medium"
                    )}>
                      {verse.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Chapter Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-8 pt-6 sm:pt-8 border-t border-border max-w-4xl mx-auto">
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
                className="w-full sm:w-auto justify-center sm:justify-start"
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
    </div>
  );
}
