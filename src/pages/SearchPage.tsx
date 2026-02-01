import { useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";
import { Search, BookOpen, Book, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import {
  useBibleSearch,
  type BibleSearchResult,
  type WMBSermonResult,
} from "@/hooks/useBibleSearch";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/dove-peace.jpg";
import { themeLibrary } from "@/data/themeLibrary";
import {
  searchThemes,
  highlightQuery,
  type ThemeSearchResult,
} from "@/lib/themeSearch";

type SearchMode = "keyword" | "verse" | "theme";

const defaultThemeResults: ThemeSearchResult[] = themeLibrary.map((entry) => ({
  ...entry,
  matchScore: 0,
  matchedKeywords: [],
}));

const RESULTS_PER_PAGE = 50;

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword");
  const [activeTab, setActiveTab] = useState("bible");
  const [bibleResults, setBibleResults] = useState<BibleSearchResult[]>([]);
  const [sermonResults, setSermonResults] = useState<WMBSermonResult[]>([]);
  const [themeResults, setThemeResults] = useState<ThemeSearchResult[]>(
    defaultThemeResults,
  );
  const [pendingScrollQuery, setPendingScrollQuery] = useState<string | null>(
    null,
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [bibleFilter, setBibleFilter] = useState<"all" | "ot" | "nt">("all");
  const [selectedBibleBook, setSelectedBibleBook] = useState("all");
  const [sermonYear, setSermonYear] = useState("all");
  const [sermonLocation, setSermonLocation] = useState("all");
  const [sermonTheme, setSermonTheme] = useState("all");
  const [bibleDisplayCount, setBibleDisplayCount] = useState(RESULTS_PER_PAGE);
  const [sermonDisplayCount, setSermonDisplayCount] = useState(RESULTS_PER_PAGE);
  const { searchBible, searchWMBSermons, loading } = useBibleSearch();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement | null>(null);


  const placeholders: Record<SearchMode, string> = {
    keyword: "Search by keyword, verse, or message theme...",
    verse: "Type a verse like 'John 3:16' or 'Psalm 23'...",
    theme: "Look up a theme such as 'Grace', 'Healing', or 'End Time'...",
  };

  const renderHighlightedText = useCallback(
    (text: string): ReactNode => {
      const parts = highlightQuery(text, searchQuery).map((segment, index) =>
        typeof segment === "string" ? (
          <span key={`${segment}-${index}`}>{segment}</span>
        ) : (
          <mark
            key={`${segment.highlight}-${index}`}
            className="rounded-sm bg-primary/20 px-1 text-primary"
          >
            {segment.highlight}
          </mark>
        ),
      );

      return parts;
    },
    [searchQuery],
  );

  const handleResultClick = useCallback(
    (book: string, chapter: number, verse: number) => {
      const params = new URLSearchParams();
      params.set("book", book);
      params.set("chapter", chapter.toString());
      params.set("verse", verse.toString());
      navigate(`/reader?${params.toString()}`);
    },
    [navigate],
  );

  const handleSearch = useCallback(
    async (query: string, mode: SearchMode = searchMode) => {
      setSearchQuery(query);
      const trimmed = query.trim();

      // Reset pagination when new search
      setBibleDisplayCount(RESULTS_PER_PAGE);
      setSermonDisplayCount(RESULTS_PER_PAGE);

      if (mode === "theme") {
        setActiveTab("themes");
      } else if (mode === "verse") {
        setActiveTab("bible");
      }

      if (!trimmed) {
        setThemeResults(defaultThemeResults);
        setBibleResults([]);
        setSermonResults([]);
        setPendingScrollQuery(null);
        return;
      }

      setPendingScrollQuery(trimmed);

      const themeMatches = searchThemes(query);
      setThemeResults(themeMatches.length > 0 ? themeMatches : []);

      const [bibleData, sermonData] = await Promise.all([
        searchBible(query),
        searchWMBSermons(query),
      ]);

      console.log(`[SearchPage] Bible results: ${bibleData.length}, Sermon results: ${sermonData.length}`);
      setBibleResults(bibleData);
      setSermonResults(sermonData);
    },
    [searchBible, searchWMBSermons, searchMode],
  );

  useEffect(() => {
    if (!pendingScrollQuery) {
      return;
    }

    if (!searchQuery.trim()) {
      setPendingScrollQuery(null);
      return;
    }

    if (isSearchFocused) {
      return;
    }

    const hasResults =
      bibleResults.length > 0 ||
      sermonResults.length > 0 ||
      themeResults.length > 0;

    if (!hasResults) {
      return;
    }

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setPendingScrollQuery(null);
  }, [
    pendingScrollQuery,
    bibleResults.length,
    sermonResults.length,
    themeResults.length,
    searchQuery,
    isSearchFocused,
  ]);

  const handleThemeExplore = useCallback(
    (themeName: string) => {
      setSearchMode("theme");
      setActiveTab("themes");
      void handleSearch(themeName, "theme");
    },
    [handleSearch],
  );

  const bibleBookOptions = useMemo(() => {
    const books = new Set<string>();
    bibleResults.forEach((result) => books.add(result.book));
    return Array.from(books).sort((a, b) => a.localeCompare(b));
  }, [bibleResults]);

  const filteredBibleResults = useMemo(() => {
    return bibleResults.filter((result) => {
      const matchesTestament =
        bibleFilter === "all" || result.testament.toLowerCase() === bibleFilter;
      const matchesBook =
        selectedBibleBook === "all" || result.book === selectedBibleBook;
      return matchesTestament && matchesBook;
    });
  }, [bibleResults, bibleFilter, selectedBibleBook]);

  // Paginated results for display
  const paginatedBibleResults = useMemo(() => {
    return filteredBibleResults.slice(0, bibleDisplayCount);
  }, [filteredBibleResults, bibleDisplayCount]);

  const sermonYearOptions = useMemo(() => {
    const years = new Set<string>();
    sermonResults.forEach((result) => {
      if (result.year) {
        years.add(result.year.toString());
      }
    });
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [sermonResults]);

  const sermonLocationOptions = useMemo(() => {
    const locations = new Set<string>();
    sermonResults.forEach((result) => {
      if (result.location) {
        locations.add(result.location);
      }
    });
    return Array.from(locations).sort((a, b) => a.localeCompare(b));
  }, [sermonResults]);

  const sermonThemeOptions = useMemo(() => {
    const themes = new Set<string>();
    sermonResults.forEach((result) => {
      (result.themes ?? []).forEach((theme) => themes.add(theme));
    });
    return Array.from(themes).sort((a, b) => a.localeCompare(b));
  }, [sermonResults]);

  const filteredSermonResults = useMemo(() => {
    return sermonResults.filter((result) => {
      const matchesYear =
        sermonYear === "all" || String(result.year ?? "") === sermonYear;
      const matchesLocation =
        sermonLocation === "all" || result.location === sermonLocation;
      const matchesTheme =
        sermonTheme === "all" || (result.themes ?? []).includes(sermonTheme);
      return matchesYear && matchesLocation && matchesTheme;
    });
  }, [sermonResults, sermonYear, sermonLocation, sermonTheme]);

  // Paginated results for display
  const paginatedSermonResults = useMemo(() => {
    return filteredSermonResults.slice(0, sermonDisplayCount);
  }, [filteredSermonResults, sermonDisplayCount]);

  const hasThemeQuery = searchQuery.trim().length > 0;
  const displayedThemeResults = hasThemeQuery
    ? themeResults
    : defaultThemeResults;
  const noThemeMatches = hasThemeQuery && themeResults.length === 0;

  const searchPlaceholder = placeholders[searchMode];
  const themeCount = hasThemeQuery ? themeResults.length : defaultThemeResults.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showBackButton />

      {/* Hero Section with Search */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/80" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Search the Scriptures
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore God's Word and William Branham's messages
            </p>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full rounded-2xl border border-border/70 bg-background/90 pl-12 pr-4 py-4 text-base sm:text-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => {
                  void handleSearch(e.target.value, searchMode);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>

            <ToggleGroup
              type="single"
              value={searchMode}
              onValueChange={(value) => {
                if (value) {
                  const mode = value as SearchMode;
                  setSearchMode(mode);
                  if (mode === "theme") {
                    setActiveTab("themes");
                  }
                  if (mode === "verse") {
                    setActiveTab("bible");
                  }
                }
              }}
              className="mt-4 flex w-full flex-wrap items-center justify-center gap-2"
            >
              <ToggleGroupItem
                value="keyword"
                className="px-4 py-2 text-sm flex-1 min-w-[120px] sm:flex-none"
                aria-label="Keyword search"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Keywords</span>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="verse"
                className="px-4 py-2 text-sm flex-1 min-w-[120px] sm:flex-none"
                aria-label="Verse search"
              >
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span>Verses</span>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="theme"
                className="px-4 py-2 text-sm flex-1 min-w-[120px] sm:flex-none"
                aria-label="Theme search"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Themes</span>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="mt-6 flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Cross References
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">
                      Cross References &amp; Search
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Search for keywords or look up verse references
                    </p>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden px-6 py-4">
                    <CrossReferenceViewer
                      initialSearchQuery={searchQuery}
                      onNavigate={(book, chapter, verse) => {
                        const params = new URLSearchParams();
                        params.set("book", book);
                        params.set("chapter", chapter.toString());
                        if (verse !== undefined) {
                          params.set("verse", verse.toString());
                        }
                        navigate(`/reader?${params.toString()}`);
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section ref={resultsRef} id="search-results" className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-1 gap-2 sm:grid-cols-3 mb-8">
                <TabsTrigger value="bible" className="gap-2">
                  <Book className="h-4 w-4" />
                  Bible ({filteredBibleResults.length})
                </TabsTrigger>
                <TabsTrigger value="sermons" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Sermons ({filteredSermonResults.length})
                </TabsTrigger>
                <TabsTrigger value="themes" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Themes ({themeCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bible" className="space-y-4">
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Refine verses
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                    <Select
                      value={bibleFilter}
                      onValueChange={(value) =>
                        setBibleFilter(value as "all" | "ot" | "nt")
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Select testament" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Testaments</SelectItem>
                        <SelectItem value="ot">Old Testament</SelectItem>
                        <SelectItem value="nt">New Testament</SelectItem>
                      </SelectContent>
                    </Select>

                    {bibleBookOptions.length > 1 && (
                      <Select
                        value={selectedBibleBook}
                        onValueChange={setSelectedBibleBook}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="All books" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Books</SelectItem>
                          {bibleBookOptions.map((book) => (
                            <SelectItem key={book} value={book}>
                              {book}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {(bibleFilter !== "all" || selectedBibleBook !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setBibleFilter("all");
                          setSelectedBibleBook("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show total count info */}
                {filteredBibleResults.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">
                    Showing {Math.min(bibleDisplayCount, filteredBibleResults.length)} of{" "}
                    <strong>{filteredBibleResults.length}</strong> total results
                    {bibleResults.length !== filteredBibleResults.length && (
                      <span> ({bibleResults.length} total before filters)</span>
                    )}
                  </div>
                )}

                {paginatedBibleResults.length > 0 ? (
                  <>
                    {paginatedBibleResults.map((result, index) => (
                      <Card
                        key={`${result.book}-${result.chapter}-${result.verse}-${index}`}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() =>
                          handleResultClick(result.book, result.chapter, result.verse)
                        }
                      >
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">
                                {result.book} {result.chapter}:{result.verse}
                              </Badge>
                              <Badge variant="outline">{result.testament}</Badge>
                            </div>
                          </div>
                          <p className="text-foreground leading-relaxed text-left">
                            {renderHighlightedText(result.text)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Load More button */}
                    {bibleDisplayCount < filteredBibleResults.length && (
                      <div className="text-center py-6">
                        <Button
                          onClick={() => setBibleDisplayCount(prev => prev + RESULTS_PER_PAGE)}
                          variant="outline"
                          size="lg"
                        >
                          Load More ({filteredBibleResults.length - bibleDisplayCount} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? bibleResults.length > 0
                          ? "No Bible verses match the selected filters."
                          : "No Bible verses found. Try adjusting your search keywords or switch to a verse reference."
                        : "Enter a search term to find Bible verses"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sermons" className="space-y-4">
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Refine messages
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                    {sermonYearOptions.length > 0 && (
                      <Select value={sermonYear} onValueChange={setSermonYear}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="All years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {sermonYearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {sermonLocationOptions.length > 0 && (
                      <Select
                        value={sermonLocation}
                        onValueChange={setSermonLocation}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {sermonLocationOptions.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {sermonThemeOptions.length > 0 && (
                      <Select value={sermonTheme} onValueChange={setSermonTheme}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="All themes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Themes</SelectItem>
                          {sermonThemeOptions.map((theme) => (
                            <SelectItem key={theme} value={theme}>
                              {theme}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {(sermonYear !== "all" ||
                      sermonLocation !== "all" ||
                      sermonTheme !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setSermonYear("all");
                          setSermonLocation("all");
                          setSermonTheme("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>

                {filteredSermonResults.length > 0 ? (
                  filteredSermonResults.map((result) => (
                    <Card
                      key={`${result.sermon_id}-${result.paragraph}`}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {result.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <span>{result.date}</span>
                              {result.location && <span>• {result.location}</span>}
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            ¶ {result.paragraph}
                          </Badge>
                        </div>

                        {(result.themes ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(result.themes ?? []).map((theme) => (
                              <Badge key={theme} variant="outline">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <blockquote className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r">
                          <p className="text-foreground leading-relaxed italic">
                            “{renderHighlightedText(result.excerpt)}”
                          </p>
                        </blockquote>

                        {(result.bibleReferences ?? []).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            References: {(result.bibleReferences ?? []).join(", ")}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Paragraph {result.paragraph} from “{result.title}”
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? sermonResults.length > 0
                          ? "No sermons match the selected filters."
                          : "No sermons found. Try different keywords or explore a theme."
                        : "Enter a search term to find sermons"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="themes" className="space-y-4">
                {noThemeMatches ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No themes matched “{searchQuery}”. Try a related keyword or
                      select one of the suggested themes above.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {displayedThemeResults.map((theme) => {
                      const keywordsToDisplay =
                        hasThemeQuery && theme.matchedKeywords.length > 0
                          ? theme.matchedKeywords
                          : theme.keywords.slice(0, 4);

                      return (
                        <Card key={theme.id} className="h-full flex flex-col">
                          <CardContent className="p-6 flex h-full flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-left">
                                  <h3 className="text-xl font-semibold text-foreground">
                                    {renderHighlightedText(theme.theme)}
                                  </h3>
                                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                    {renderHighlightedText(theme.description)}
                                  </p>
                                </div>
                                {hasThemeQuery && theme.matchScore > 0 && (
                                  <Badge variant="outline">Relevance {theme.matchScore}</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {keywordsToDisplay.map((keyword) => (
                                  <Badge key={keyword} variant="secondary">
                                    #{keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Key Scriptures
                              </h4>
                              <ul className="space-y-3 text-left">
                                {theme.scriptureHighlights.slice(0, 3).map((reference) => {
                                  const referenceLabel = `${reference.book} ${reference.chapter}:${reference.verseStart}${reference.verseEnd ? `-${reference.verseEnd}` : ""}`;

                                  return (
                                    <li key={`${theme.id}-${referenceLabel}`}>
                                      <p className="text-sm font-medium text-foreground">
                                        {renderHighlightedText(referenceLabel)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {renderHighlightedText(reference.summary)}
                                      </p>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                Featured Sermons
                              </h4>
                              <ul className="space-y-2 text-left">
                                {theme.sermonHighlights.slice(0, 3).map((sermon) => (
                                  <li key={`${theme.id}-${sermon.title}`}>
                                    <p className="text-sm font-medium text-foreground">
                                      {renderHighlightedText(sermon.title)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {sermon.date} • {sermon.location}
                                      {sermon.paragraph ? ` • ¶ ${sermon.paragraph}` : ""}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {renderHighlightedText(sermon.summary)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-auto pt-2 text-left">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleThemeExplore(theme.theme)}
                              >
                                Explore theme insights
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      <Footer />
      <Navigation />
    </div>
  );
};

export default SearchPage;
