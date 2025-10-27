import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CrossReferenceViewer from "@/components/CrossReferenceViewer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function CrossReferences() {
  const navigate = useNavigate();

  const handleNavigateToVerse = (book: string, chapter: number) => {
    navigate(`/bible?book=${encodeURIComponent(book)}&chapter=${chapter}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="md:hidden shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cross References</h1>
            <p className="text-sm text-muted-foreground">Discover connected scriptures</p>
          </div>
        </div>
      </div>

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-250px)]">
          <CrossReferenceViewer onNavigate={handleNavigateToVerse} />
        </div>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
