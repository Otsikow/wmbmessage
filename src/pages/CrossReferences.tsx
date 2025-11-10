import { useNavigate, useSearchParams } from "react-router-dom";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

export default function CrossReferences() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";

  const handleNavigateToVerse = (book: string, chapter: number, verse?: number) => {
    const params = new URLSearchParams();
    params.set("book", book);
    params.set("chapter", chapter.toString());
    if (verse !== undefined) {
      params.set("verse", verse.toString());
    }
    navigate(`/bible?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Cross References</h1>
            <p className="text-sm text-muted-foreground">Discover connected scriptures</p>
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-250px)]">
          <CrossReferenceViewer
            onNavigate={handleNavigateToVerse}
            initialSearchQuery={initialQuery}
            initialTab={initialQuery ? "search" : undefined}
          />
        </div>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
