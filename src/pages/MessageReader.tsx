import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Bookmark,
  List,
  ChevronUp,
} from "lucide-react";
import { useSermons, Sermon, SermonWithParagraphs } from "@/hooks/useSermons";
import { useBookmarks } from "@/hooks/useBookmarks";
import SermonList from "@/components/SermonList";
import SermonParagraph from "@/components/SermonParagraph";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import churchInteriorImage from "@/assets/church-interior.jpg";

export default function MessageReader() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSermon, setSelectedSermon] = useState<SermonWithParagraphs | null>(
    null
  );
  const [loadingSermon, setLoadingSermon] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { sermons, loading, fetchSermonWithParagraphs } = useSermons();
  const { bookmarks } = useBookmarks(selectedSermon?.id);

  // Get sermon ID from URL params
  const sermonIdFromUrl = searchParams.get("sermon");

  // Load sermon from URL on mount
  useEffect(() => {
    if (sermonIdFromUrl && !selectedSermon) {
      loadSermon(sermonIdFromUrl);
    }
  }, [sermonIdFromUrl]);

  // Handle scroll to show "back to top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadSermon = async (sermonId: string) => {
    setLoadingSermon(true);
    const sermon = await fetchSermonWithParagraphs(sermonId);
    if (sermon) {
      setSelectedSermon(sermon);
    }
    setLoadingSermon(false);
  };

  const handleSermonSelect = async (sermon: Sermon) => {
    // Update URL with sermon ID
    setSearchParams({ sermon: sermon.id });
    await loadSermon(sermon.id);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setSelectedSermon(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get bookmarked paragraph numbers for quick access
  const bookmarkedParagraphs = bookmarks.map((b) => b.paragraph_number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={churchInteriorImage}
          alt="Church Interior"
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
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Message Reader
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {selectedSermon
                    ? selectedSermon.title
                    : "Explore William Branham's sermons"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          {!selectedSermon ? (
            // Show sermon list
            <SermonList
              sermons={sermons}
              loading={loading}
              onSermonSelect={handleSermonSelect}
            />
          ) : (
            // Show selected sermon
            <div className="space-y-6">
              {/* Back button and sermon info */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="mb-4"
                >
                  <List className="h-4 w-4 mr-2" />
                  Back to Sermon List
                </Button>

                <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                  <div className="space-y-3">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {selectedSermon.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedSermon.date)}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedSermon.location}</span>
                      </div>
                    </div>

                    {/* Bookmarked paragraphs quick access */}
                    {bookmarkedParagraphs.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Bookmark className="h-3 w-3" />
                          Your Bookmarks:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {bookmarkedParagraphs.map((num) => (
                            <Badge
                              key={num}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => {
                                const element = document.getElementById(`para-${num}`);
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }}
                            >
                              Para. {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sermon paragraphs */}
              {loadingSermon ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6">
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSermon.paragraphs && selectedSermon.paragraphs.length > 0 ? (
                    selectedSermon.paragraphs.map((paragraph) => (
                      <SermonParagraph
                        key={paragraph.id}
                        paragraph={paragraph}
                        sermonId={selectedSermon.id}
                        sermonTitle={selectedSermon.title}
                      />
                    ))
                  ) : (
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                      <p className="text-muted-foreground">
                        No content available for this sermon.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 md:right-8 rounded-full h-12 w-12 shadow-lg z-50"
          size="icon"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
