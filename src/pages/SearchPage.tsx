import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold">Search</h1>
              <p className="text-sm text-muted-foreground">
                Search the Bible and WMB sermons
              </p>
            </div>
          </div>

          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for verses, topics, or keywords..."
                className="pl-10 pr-10 h-12"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              )}
            </div>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                {searchQuery && searchResults.all.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {searchResults.all.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bible">
                Bible
                {searchQuery && searchResults.bible.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {searchResults.bible.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="wmb">
                WMB
                {searchQuery && searchResults.wmb.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {searchResults.wmb.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {!searchQuery ? (
                <Card className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Start typing to search across Bible verses and WMB sermons
                  </p>
                </Card>
              ) : searchResults.all.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No results found for "{searchQuery}"
                  </p>
                </Card>
              ) : (
                searchResults.all.map((result, index) => (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
                  >
                    {"book" in result ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Bible</Badge>
                          <span className="text-sm font-semibold text-primary">
                            {result.book} {result.chapter}:{result.verse}
                          </span>
                        </div>
                        <p className="text-base leading-relaxed">{result.text}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">WMB Sermon</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {result.date} • {result.location}
                        </p>
                        <p className="text-base leading-relaxed italic">
                          "{result.excerpt}"
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="bible" className="space-y-4 mt-6">
              {!searchQuery ? (
                <Card className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Search for Bible verses by keyword, book, or phrase
                  </p>
                </Card>
              ) : searchResults.bible.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No Bible verses found for "{searchQuery}"
                  </p>
                </Card>
              ) : (
                searchResults.bible.map((result, index) => (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="min-w-[5rem]">
                        <Badge variant="outline" className="mb-2">
                          {result.testament}
                        </Badge>
                        <div className="text-sm font-semibold text-primary">
                          {result.book} {result.chapter}:{result.verse}
                        </div>
                      </div>
                      <p className="text-base leading-relaxed">{result.text}</p>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="wmb" className="space-y-4 mt-6">
              {!searchQuery ? (
                <Card className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Search William Branham's sermons for quotes and teachings
                  </p>
                </Card>
              ) : searchResults.wmb.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No WMB sermons found for "{searchQuery}"
                  </p>
                </Card>
              ) : (
                searchResults.wmb.map((result, index) => (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-elegant transition-shadow cursor-pointer"
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{result.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{result.date}</span>
                        <span>•</span>
                        <span>{result.location}</span>
                        <span>•</span>
                        <span>¶{result.paragraph}</span>
                      </div>
                      <p className="text-base leading-relaxed italic">
                        "{result.excerpt}"
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
