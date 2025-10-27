import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { parseVerseReference, formatReference, ParsedReference } from "@/lib/verseParser";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleSearch } from "@/hooks/useBibleSearch";
import { useCrossReferences } from "@/hooks/useCrossReferences";
import { Loader2, X, BookOpen, Search, ExternalLink, BookMarked, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CrossReferenceViewerProps {
  onNavigate?: (book: string, chapter: number) => void;
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
}

export default function CrossReferenceViewer({ 
  onNavigate,
  currentBook,
  currentChapter,
  currentVerse
}: CrossReferenceViewerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [manualReferences, setManualReferences] = useState<ParsedReference[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [sermonResults, setSermonResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("search");
  
  const { searchBible, searchWMBSermons, loading: searchLoading, error: searchError } = useBibleSearch();
  
  // Fetch cross-references for current verse if viewing a specific verse
  const { 
    crossReferences, 
    userCrossReferences, 
    loading: crossRefsLoading 
  } = useCrossReferences(
    currentBook || "",
    currentChapter || 0,
    currentVerse
  );

  // Auto-switch to cross-references tab if viewing a specific verse with references
  useEffect(() => {
    if (currentBook && currentChapter && currentVerse) {
      if (crossReferences.length > 0 || userCrossReferences.length > 0) {
        setActiveTab("cross-refs");
      }
    }
  }, [currentBook, currentChapter, currentVerse, crossReferences.length, userCrossReferences.length]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    // Check if input is a verse reference
    const parsed = parseVerseReference(searchInput);
    
    if (parsed) {
      // It's a verse reference - add to manual references
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
      setActiveTab("search");
    } else {
      // It's a keyword search - search both Bible and sermons
      setIsSearching(true);
      setActiveTab("search");
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

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchResults([]);
    setSermonResults([]);
  };

  const totalCrossRefs = crossReferences.length + userCrossReferences.length;
  const hasSearchResults = searchResults.length > 0 || sermonResults.length > 0 || manualReferences.length > 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Input */}
      <div className="space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder='Try: "love", "faith", "John 3:16", "Genesis 1:1-3"'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-8"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={searchLoading || isSearching || !searchInput.trim()}>
            {searchLoading || isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>
        
        {searchError && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{searchError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Tabs for organizing content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Results
            {hasSearchResults && (
              <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                {searchResults.length + sermonResults.length + manualReferences.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cross-refs" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            Cross References
            {totalCrossRefs > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                {totalCrossRefs}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Search Results Tab */}
        <TabsContent value="search" className="mt-4 flex-1 overflow-hidden">
          <ScrollArea className="h-full rounded-md border p-4">
            {searchLoading || isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching the Bible...</p>
              </div>
            ) : (
              <>
                {/* Bible Verses */}
                {searchResults.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 sticky top-0 bg-background pb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Bible Verses</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {searchResults.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <Card 
                          key={index}
                          className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                          onClick={() => onNavigate?.(result.book, result.chapter)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                                <BookOpen className="h-3.5 w-3.5" />
                                {result.book} {result.chapter}:{result.verse}
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">{result.testament}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm leading-relaxed break-words">
                              {highlightSearchTerm(result.text, searchInput)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual References */}
                {manualReferences.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-primary" />
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

                {/* Sermon Results */}
                {sermonResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 sticky top-0 bg-background pb-2">
                      <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                      <h4 className="font-semibold text-sm">William Branham Sermons</h4>
                      <Badge variant="secondary" className="ml-auto">
                        {sermonResults.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {sermonResults.map((result, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow border-l-4 border-l-amber-600/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">
                              {result.title}
                            </CardTitle>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{result.date}</Badge>
                              <Badge variant="outline" className="text-xs">{result.location}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm leading-relaxed text-muted-foreground mb-1 break-words">
                              {highlightSearchTerm(result.excerpt, searchInput)}
                            </p>
                            <p className="text-xs text-muted-foreground/70">Paragraph {result.paragraph}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State or No Results */}
                {!hasSearchResults && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-3">
                    <Search className="h-16 w-16 text-muted-foreground/30" />
                    <div className="space-y-1">
                      {searchInput ? (
                        <>
                          <p className="text-muted-foreground font-medium">
                            No results found for "{searchInput}"
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            Try different keywords or a specific verse reference
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground font-medium">
                            Search for keywords or verse references
                          </p>
                          <p className="text-sm text-muted-foreground/70">
                            Try: "love", "faith", "healing", "John 3:16", or "Romans 8:28"
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Cross References Tab */}
        <TabsContent value="cross-refs" className="mt-4 flex-1 overflow-hidden">
          <ScrollArea className="h-full rounded-md border p-4">
            {crossRefsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading cross-references...</p>
              </div>
            ) : (
              <>
                {currentBook && currentChapter && currentVerse ? (
                  <>
                    {/* Current Verse Info */}
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Cross-references for:</p>
                      <p className="font-semibold text-primary">
                        {currentBook} {currentChapter}:{currentVerse}
                      </p>
                    </div>

                    {/* Public Cross References */}
                    {crossReferences.length > 0 && (
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-2">
                          <BookMarked className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Related Verses</h4>
                          <Badge variant="secondary" className="ml-auto">
                            {crossReferences.length}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {crossReferences.map((crossRef) => (
                            <CrossReferenceDisplay
                              key={crossRef.id}
                              crossRef={crossRef}
                              onNavigate={onNavigate}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User's Custom Cross References */}
                    {userCrossReferences.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <BookMarked className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Your Custom References</h4>
                          <Badge variant="secondary" className="ml-auto">
                            {userCrossReferences.length}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {userCrossReferences.map((crossRef) => (
                            <CrossReferenceDisplay
                              key={crossRef.id}
                              crossRef={crossRef}
                              onNavigate={onNavigate}
                              isUserRef
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Cross References */}
                    {totalCrossRefs === 0 && (
                      <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
                        <BookMarked className="h-16 w-16 text-muted-foreground/30" />
                        <div className="space-y-1">
                          <p className="text-muted-foreground font-medium">
                            No cross-references found
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Cross-references link related verses together
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
                    <BookMarked className="h-16 w-16 text-muted-foreground/30" />
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">
                        Select a specific verse to view cross-references
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Navigate to any verse in the Bible reader
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
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
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            className="text-sm font-semibold text-primary cursor-pointer hover:underline flex items-center gap-2"
            onClick={() => onNavigate?.(reference.book, reference.chapter)}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {formatReference(reference)}
            <ExternalLink className="h-3 w-3 opacity-60" />
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
      <CardContent className="pb-3">
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
                <span className="font-semibold text-primary min-w-[1.5rem] flex-shrink-0">
                  {verse.number}
                </span>
                <p className={cn(
                  "leading-relaxed break-words flex-1",
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

interface CrossReferenceDisplayProps {
  crossRef: any;
  onNavigate?: (book: string, chapter: number) => void;
  isUserRef?: boolean;
}

function CrossReferenceDisplay({ crossRef, onNavigate, isUserRef = false }: CrossReferenceDisplayProps) {
  const { verses, loading, error } = useBibleData(crossRef.to_book, crossRef.to_chapter);

  const displayVerses = verses.filter(v => {
    if (!crossRef.to_verse) return true;
    if (!crossRef.to_verse_end) return v.number === crossRef.to_verse;
    return v.number >= crossRef.to_verse && v.number <= crossRef.to_verse_end;
  });

  const referenceText = crossRef.to_verse_end && crossRef.to_verse_end !== crossRef.to_verse
    ? `${crossRef.to_book} ${crossRef.to_chapter}:${crossRef.to_verse}-${crossRef.to_verse_end}`
    : `${crossRef.to_book} ${crossRef.to_chapter}:${crossRef.to_verse}`;

  return (
    <Card className={cn(
      "border-l-4 transition-all hover:shadow-md",
      isUserRef ? "border-l-amber-500/50" : "border-l-primary/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle 
              className="text-sm font-semibold text-primary cursor-pointer hover:underline flex items-center gap-2"
              onClick={() => onNavigate?.(crossRef.to_book, crossRef.to_chapter)}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {referenceText}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </CardTitle>
            {crossRef.relationship_type && (
              <Badge variant="outline" className="text-xs">
                {crossRef.relationship_type}
              </Badge>
            )}
          </div>
          {isUserRef && (
            <Badge variant="secondary" className="text-xs">Custom</Badge>
          )}
        </div>
        {crossRef.notes && (
          <p className="text-xs text-muted-foreground italic mt-1">{crossRef.notes}</p>
        )}
      </CardHeader>
      <CardContent className="pb-3">
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
                <span className="font-semibold text-primary min-w-[1.5rem] flex-shrink-0">
                  {verse.number}
                </span>
                <p className={cn(
                  "leading-relaxed break-words flex-1",
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

// Helper function to highlight search terms in text
function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm.trim()) return text;

  const terms = searchTerm.toLowerCase().split(/\s+/);
  let result = text;
  
  // Create a regex pattern that matches any of the search terms
  const pattern = terms
    .filter(term => term.length > 2)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  if (!pattern) return text;

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = result.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex
        return isMatch ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/40 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}
