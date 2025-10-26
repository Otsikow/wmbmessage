import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { parseVerseReference, formatReference, ParsedReference } from "@/lib/verseParser";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleSearch } from "@/hooks/useBibleSearch";
import { Loader2, X, Plus, BookOpen, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CrossReferenceViewerProps {
  onNavigate?: (book: string, chapter: number) => void;
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
}

export default function CrossReferenceViewer({ 
  onNavigate
}: CrossReferenceViewerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [manualReferences, setManualReferences] = useState<ParsedReference[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sermonResults, setSermonResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<"reference" | "keyword">("keyword");
  
  const { searchBible, searchWMBSermons, loading: searchLoading } = useBibleSearch();

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    // Check if input is a verse reference
    const parsed = parseVerseReference(searchInput);
    
    if (parsed) {
      // It's a verse reference - add to manual references
      setSearchMode("reference");
      const exists = manualReferences.some(ref => 
        ref.book === parsed.book && 
        ref.chapter === parsed.chapter && 
        ref.startVerse === parsed.startVerse
      );
      
      if (!exists) {
        setManualReferences([...manualReferences, parsed]);
      }
      setSearchInput("");
      setSearchResults([]);
      setSermonResults([]);
    } else {
      // It's a keyword search - search both Bible and sermons
      setSearchMode("keyword");
      setIsSearching(true);
      try {
        const [bibleData, sermonData] = await Promise.all([
          searchBible(searchInput),
          searchWMBSermons(searchInput)
        ]);
        setSearchResults(bibleData);
        setSermonResults(sermonData);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleRemoveReference = (index: number) => {
    setManualReferences(manualReferences.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search by keyword (faith, love) or reference (John 3:16)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="icon" disabled={searchLoading || isSearching}>
            {searchLoading || isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Try: "faith", "love", "John 3:16", "Genesis 1:1-3", "Romans 8:28"
        </p>
      </div>

      <ScrollArea className="h-[500px] rounded-md border p-4">
        {searchLoading || isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Keyword Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Bible Verses</h4>
                  <Badge variant="secondary" className="ml-auto">
                    {searchResults.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => onNavigate?.(result.book, result.chapter)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
                            {result.book} {result.chapter}:{result.verse}
                            <ExternalLink className="h-3 w-3" />
                          </CardTitle>
                          <Badge variant="outline">{result.testament}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{result.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Sermon Results */}
            {sermonResults.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">William Branham Sermons</h4>
                  <Badge variant="secondary" className="ml-auto">
                    {sermonResults.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {sermonResults.map((result, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {result.title}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{result.date}</Badge>
                          <Badge variant="outline" className="text-xs">{result.location}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground mb-2">{result.excerpt}</p>
                        <p className="text-xs text-muted-foreground">Paragraph {result.paragraph}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Manual References */}
            {manualReferences.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Verse References</h4>
                  <Badge variant="secondary" className="ml-auto">
                    {manualReferences.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {manualReferences.map((ref, index) => (
                    <ManualReferenceDisplay
                      key={index}
                      reference={ref}
                      onRemove={() => handleRemoveReference(index)}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && sermonResults.length === 0 && manualReferences.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-2">
                <Search className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  Search for keywords or verse references
                </p>
                <p className="text-xs text-muted-foreground">
                  Try: "love", "faith", "healing", or "John 3:16"
                </p>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}


interface ManualReferenceDisplayProps {
  reference: ParsedReference;
  onRemove: () => void;
  onNavigate?: (book: string, chapter: number) => void;
}

function ManualReferenceDisplay({ reference, onRemove, onNavigate }: ManualReferenceDisplayProps) {
  const { verses, loading, error } = useBibleData(reference.book, reference.chapter);

  const displayVerses = verses.filter(v => {
    if (!reference.startVerse) return true;
    if (!reference.endVerse) return v.number === reference.startVerse;
    return v.number >= reference.startVerse && v.number <= reference.endVerse;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            className="text-base font-semibold text-primary cursor-pointer hover:underline flex items-center gap-2"
            onClick={() => onNavigate?.(reference.book, reference.chapter)}
          >
            {formatReference(reference)}
            <ExternalLink className="h-3 w-3" />
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-2">
            {displayVerses.map((verse) => (
              <div key={verse.number} className="flex gap-2 text-sm">
                <span className="font-semibold text-primary min-w-[1.5rem]">
                  {verse.number}
                </span>
                <p className={cn(
                  "leading-relaxed",
                  verse.isJesusWords && "text-jesus-words font-medium"
                )}>
                  {verse.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
