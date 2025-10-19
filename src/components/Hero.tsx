import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-subtle-gradient py-20 md:py-32">
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Your Guide to the
              <span className="block bg-hero-gradient bg-clip-text text-transparent mt-2">
                Message of Truth
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Read the Bible, explore William Marrion Branham's sermons, and discover connections between scripture and prophetic messages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/reader">
              <Button size="lg" className="w-full sm:w-auto shadow-elegant hover:shadow-glow transition-all">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Search Scripture
              </Button>
            </Link>
            <Link to="/wmb-sermons">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <MessageSquare className="mr-2 h-5 w-5" />
                WMB Sermons
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <div className="p-6 rounded-xl bg-card shadow-sm hover:shadow-elegant transition-all">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Bible Reading</h3>
              <p className="text-sm text-muted-foreground">
                Read scripture with powerful search, notes, and cross-references
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card shadow-sm hover:shadow-elegant transition-all">
              <MessageSquare className="h-8 w-8 text-secondary mb-3" />
              <h3 className="font-semibold mb-2">WMB Sermons</h3>
              <p className="text-sm text-muted-foreground">
                Explore sermons with verse connections and deep insights
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card shadow-sm hover:shadow-elegant transition-all">
              <Search className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Find verses, topics, and sermon quotes instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
