import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Loader2, BookOpen, MessageSquare, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useBibleSearch, BibleSearchResult, WMBSermonResult } from "@/hooks/useBibleSearch";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import bibleStudyImage from "@/assets/bible-study.jpg";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [crossRefMode, setCrossRefMode] = useState(false);
  const { searchBible, searchWMBSermons, loading } = useBibleSearch();
  const [bibleResults, setBibleResults] = useState<BibleSearchResult[]>([]);
  const [wmbResults, setWMBResults] = useState<WMBSermonResult[]>([]);

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setBibleResults([]);
        setWMBResults([]);
        return;
      }

      const [bibleData, wmbData] = await Promise.all([
        searchBible(searchQuery),
        searchWMBSermons(searchQuery),
      ]);

      setBibleResults(bibleData);
      setWMBResults(wmbData);
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchBible, searchWMBSermons]);

  const searchResults = useMemo(() => {
    const allResults = [
      ...bibleResults.map((r) => ({ ...r, type: "bible" as const })),
      ...wmbResults.map((r) => ({ ...r, type: "wmb" as const })),
    ];

    return {
      bible: bibleResults,
  wmb: wmbResults,
  all: allResults,bible: bibleResults,
  wmb: wmbResults,
  all: allResults,bible: bibleResults,
      wmb: wmb: wmbResults,
     all: allResults, all: allResults: allResults,
    };
  }, [bibleResults, wmbResults]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleNavigateFromCrossRef = (book: string, chapter: number) => {
    setCrossRefMode(false);
    navigate(`/reader?book=${book}&chapter=${chapter}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero Section with Background Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={bibleStudyImage} 
          alt="Bible Study" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="md:hidden shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Search</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Search the Bible and WMB sermons with cross-references
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm mb-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search Bible verses, books, or WMB sermons..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={crossRefMode} onOpenChange={setCrossRefMode}>
                  <DialogTrigger asChild>
                    <Button
                      variant={crossRefMode ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                    >
                      <Link2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Cross-Reference Mode</span>
                      <span className="sm:hidden">Cross-Ref</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Cross References</DialogTitle>
                      <DialogDescription>
                        Look up and compare verses from different parts of the Bible
                      </DialogDescription>
                    </DialogHeader>
                    <CrossReferenceViewer onNavigate={handleNavigateFromCrossRef} />
                  </DialogContent>
                </Dialog>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <span>All</span>
                {searchQuery && searchResults.all.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {searchResults.all.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bible" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Bible</span>
                {searchQuery && searchResults.bible.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {searchResults.bible.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="wmb" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sermons</span>
                {searchQuery && searchResults.wmb.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {searchResults.wmb.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 sm:space-y-4">
              {!searchQuery ? (
                <div className="bg-card border border-border rounded-lg p-8 sm:p-12 text-center">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Start Your Search</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    Search across the entire KJV Bible and William Branham's sermons. 
                    {crossRefMode && " Cross-reference mode helps you find related passages."}
                  </p>
                </div>
              ) : searchResults.all.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : (
                searchResults.all.map((result, index) => (
                <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {"book" in result && navigate(`/reader?book=${result.book}&chapter=${result.chapter}`)}}
                  >
                    {"book" in result ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Bible</Badge>
                          <span className="text-xs sm:text-sm font-semibold text-primary">
                            {result.book} {result.chapter}:{result.verse}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">{result.text}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">WMB Sermon</Badge>
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg">{result.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {result.date} • {result.location}
                        </p>
                        <p className="text-sm sm:text-base leading-relaxed italic">
                          "{result.excerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="bible" className="space-y-3 sm:space-y-4">
              {!searchQuery ? (
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Search for Bible verses by keyword, book, or phrase
                  </p>
                </div>
              ) : searchResults.bible.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground">
                    No Bible verses found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                searchResults.bible.map((result, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/reader?book=${result.book}&chapter=${result.chapter}`)}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="min-w-[4rem] sm:min-w-[5rem]">
                        <Badge variant="outline" className="mb-2 text-xs">
                          {result.testament}
                        </Badge>
                        <div className="text-xs sm:text-sm font-semibold text-primary">
                          {result.book} {result.chapter}:{result.verse}
                        </div>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed">{result.text}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="wmb" className="space-y-3 sm:space-y-4">
              {!searchQuery ? (
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Search William Branham's sermons for quotes and teachings
                  </p>
                </div>
              ) : searchResults.wmb.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground">
                    No WMB sermons found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                searchResults.wmb.map((result, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg">{result.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>{result.date}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{result.location}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>¶{result.paragraph}</span>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed italic">
                        "{result.excerpt}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
