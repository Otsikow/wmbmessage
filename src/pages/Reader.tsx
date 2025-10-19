import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Settings, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reader() {
  const navigate = useNavigate();
  const [currentBook, setCurrentBook] = useState("Genesis");
  const [currentChapter, setCurrentChapter] = useState(1);

  const books = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
  
  // Mock verses for demonstration
  const verses = Array.from({ length: 31 }, (_, i) => ({
    number: i + 1,
    text: `In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep.`,
  }));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Top Navigation */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Select value={currentBook} onValueChange={setCurrentBook}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book} value={book}>
                  {book}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              Chapter {currentChapter}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentChapter(currentChapter + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
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

          <div className="space-y-4 max-w-3xl mx-auto">
            {verses.map((verse) => (
              <div
                key={verse.number}
                className="group flex gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-primary min-w-[2rem] text-right">
                  {verse.number}
                </span>
                <p className="text-base leading-relaxed">{verse.text}</p>
              </div>
            ))}
          </div>

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
              onClick={() => setCurrentChapter(currentChapter + 1)}
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
