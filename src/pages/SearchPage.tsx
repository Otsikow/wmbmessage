import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Loader2, BookOpen, MessageSquare, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import bibleStudyImage from "@/assets/bible-study.jpg";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [crossRefMode, setCrossRefMode] = useState(false);

  // Mock Bible database
  const bibleVerses = [
    {
      book: "John",
      chapter: 3,
      verse: 16,
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      testament: "NT",
    },
    {
      book: "Romans",
      chapter: 8,
      verse: 28,
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      testament: "NT",
    },
    {
      book: "Genesis",
      chapter: 1,
      verse: 1,
      text: "In the beginning God created the heaven and the earth.",
      testament: "OT",
    },
    {
      book: "Psalm",
      chapter: 23,
      verse: 1,
      text: "The LORD is my shepherd; I shall not want.",
      testament: "OT",
    },
    {
      book: "Matthew",
      chapter: 5,
      verse: 16,
      text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
      testament: "NT",
    },
  ];

  // Mock WMB sermons database
  const wmbSermons = [
    {
      title: "The Spoken Word is the Original Seed",
      date: "March 18, 1962",
      location: "Jeffersonville, IN",
      excerpt: "God's Word is the original seed. Any seed will bring forth after its kind...",
      paragraph: 45,
    },
    {
      title: "Christ is the Mystery of God Revealed",
      date: "July 28, 1963",
      location: "Jeffersonville, IN",
      excerpt: "Christ is God's mystery revealed to His people in this last day...",
      paragraph: 12,
    },
    {
      title: "The Seven Church Ages",
      date: "December 1960",
      location: "Jeffersonville, IN",
      excerpt: "The seven church ages represent the complete history of the church...",
      paragraph: 8,
    },
  ];

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { bible: [], wmb: [], all: [] };
    }

    const query = searchQuery.toLowerCase();

    // Search Bible verses
    const bibleResults = bibleVerses.filter(
      (verse) =>
        verse.text.toLowerCase().includes(query) ||
        verse.book.toLowerCase().includes(query)
    );

    // Search WMB sermons
    const wmbResults = wmbSermons.filter(
      (sermon) =>
        sermon.title.toLowerCase().includes(query) ||
        sermon.excerpt.toLowerCase().includes(query) ||
        sermon.location.toLowerCase().includes(query)
    );

    // Combined results
    const allResults = [
      ...bibleResults.map((r) => ({ ...r, type: "bible" })),
      ...wmbResults.map((r) => ({ ...r, type: "wmb" })),
    ];

    return {
      bible: bibleResults,
      wmb: wmbResults,
      all: allResults,
    };
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 300);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Hero Section with Background Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={bibleStudyImage} 
          alt="Bible Study" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
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
                <Button
                  variant={crossRefMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrossRefMode(!crossRefMode)}
                  className="gap-2"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Cross-Reference Mode</span>
                  <span className="sm:hidden">Cross-Ref</span>
                </Button>
                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
