import { useState } from "react";
import { Search, BookOpen, Book } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import { useBibleSearch } from "@/hooks/useBibleSearch";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-modern.jpg";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bibleResults, setBibleResults] = useState<any[]>([]);
  const [sermonResults, setSermonResults] = useState<any[]>([]);
  const { searchBible, searchWMBSermons, loading } = useBibleSearch();
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const [bibleData, sermonData] = await Promise.all([
        searchBible(query),
        searchWMBSermons(query)
      ]);
      setBibleResults(bibleData);
      setSermonResults(sermonData);
    } else {
      setBibleResults([]);
      setSermonResults([]);
    }
  };

  const handleResultClick = (book: string, chapter: number, verse: number) => {
    navigate(`/reader?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section with Search */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Search the Scriptures
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore God's Word and William Branham's messages
            </p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by verse, keyword, or topic..."
                className="pl-12 pr-4 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Cross References
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
                  <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl">Cross References & Search</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Search for keywords or look up verse references
                    </p>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden px-6 py-4">
                    <CrossReferenceViewer 
                      onNavigate={(book, chapter) => {
                        navigate(`/reader?book=${encodeURIComponent(book)}&chapter=${chapter}`);
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
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <Tabs defaultValue="bible" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="bible" className="gap-2">
                  <Book className="h-4 w-4" />
                  Bible ({bibleResults.length})
                </TabsTrigger>
                <TabsTrigger value="sermons" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Sermons ({sermonResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bible" className="space-y-4">
                {bibleResults.length > 0 ? (
                  bibleResults.map((result, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleResultClick(result.book, result.chapter, result.verse)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {result.book} {result.chapter}:{result.verse}
                            </Badge>
                            <Badge variant="outline">{result.testament}</Badge>
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed">{result.text}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? "No Bible verses found" : "Enter a search term to find Bible verses"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sermons" className="space-y-4">
                {sermonResults.length > 0 ? (
                  sermonResults.map((result, index) => (
                    <Card key={`${result.sermon_id}-${result.paragraph}`} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-foreground">
                            {result.title}
                          </h3>
                          <Badge variant="secondary" className="shrink-0 ml-2">
                            ¶ {result.paragraph}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="outline">{result.date}</Badge>
                          <Badge variant="outline">{result.location}</Badge>
                        </div>
                        <blockquote className="border-l-4 border-primary pl-4 py-2 mb-2 bg-muted/30 rounded-r">
                          <p className="text-foreground leading-relaxed italic">
                            "{result.excerpt}"
                          </p>
                        </blockquote>
                        <p className="text-xs text-muted-foreground mt-2">
                          Paragraph {result.paragraph} from "{result.title}"
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? "No sermons found" : "Enter a search term to find sermons"}
                    </p>
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
