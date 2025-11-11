import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DailyQuote from "@/components/DailyQuote";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

export default function DailyVerse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 py-3 px-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Daily Quote</h1>
        </div>
      </div>

      <div className="flex-1 container max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <DailyQuote />
        
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">About Daily Quotes</h2>
          <p className="text-muted-foreground leading-relaxed">
            Each day pairs a Bible verse with a quote from William Branham, bringing together
            scripture and the prophetic message. Use the calendar to revisit any previous
            day and continue your devotional journey without missing a moment of inspiration.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/bible")}>
              Read the Bible
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Search Scriptures
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
