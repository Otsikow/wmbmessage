import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Settings, Search, ArrowLeft, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBibleData, BIBLE_BOOKS } from "@/hooks/useBibleData";
import { cn } from "@/lib/utils";

export default function Reader() {
  const navigate = useNavigate();
  const [currentBook, setCurrentBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [crossRefSearch, setCrossRefSearch] = useState("");
  const [showCrossRef, setShowCrossRef] = useState(false);

  const { verses, loading, error } = useBibleData(currentBook, currentChapter);
  
  const currentBookData = BIBLE_BOOKS.find(b => b.name === currentBook);
  const maxChapter = currentBookData?.chapters || 1;

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
          
          <Select value={currentBook} onValueChange={(value) => {
            setCurrentBook(value);
            setCurrentChapter(1);
          }}>
            <SelectTrigger className="w-[120px] sm:w-[140px] md:w-[180px] shrink-0">
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

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium min-w-[60px] sm:min-w-[80px] text-center">
              Ch {currentChapter}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(Math.min(maxChapter, currentChapter + 1))}
              disabled={currentChapter >= maxChapter}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Dialog open={showCrossRef} onOpenChange={setShowCrossRef}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Cross References" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Link2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cross References</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search cross references..."
                    value={crossRefSearch}
                    onChange={(e) => setCrossRefSearch(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a verse reference (e.g., John 3:16) to find related passages
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => navigate("/search")} className="h-8 w-8 sm:h-9 sm:w-9">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bible Content */}
      <div className="container py-8">
        <Card className="p-6 md:p-8 shadow-elegant">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
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
            <div className="space-y-4 max-w-3xl mx-auto">
              {verses.map((verse) => (
                <div
                  key={verse.number}
                  className="group flex gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-primary min-w-[2rem] text-right">
                    {verse.number}
                  </span>
                  <p className={cn(
                    "text-base leading-relaxed",
                    verse.isJesusWords && "text-jesus-words font-medium"
                  )}>
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Chapter
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentChapter(Math.min(maxChapter, currentChapter + 1))}
              disabled={currentChapter >= maxChapter}
            >
              Next Chapter
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
