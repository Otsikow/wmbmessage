import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import DailyQuote from "@/components/DailyQuote";
import RecentBibleVerses from "@/components/RecentBibleVerses";
import FlipTilesGrid from "@/components/FlipTilesGrid";
import heroImage from "@/assets/bible-hero-bg.jpg";
import logoImage from "@/assets/logo-hero.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Bible Study"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      <div className="container responsive-section relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up px-2 sm:px-0">
          {/* Logo */}
          <div className="mb-6">
            <img
              src={logoImage}
              alt="MessageGuide Logo"
              className="h-20 sm:h-24 md:h-32 w-auto mx-auto drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Your Guide to the
              <span className="block text-primary mt-2">Message of The Hour</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Read the Bible, explore William Marrion Branham's sermons, and
              discover connections between scripture and prophetic messages.
            </p>
          </div>

          {/* Action Buttons (merged cleanly) */}
          <div className="flex flex-col w-full max-w-3xl gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link to="/plans" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full text-foreground border border-border bg-white/10 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-white/15 hover:border-primary/60"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Bible Reading Plans
              </Button>
            </Link>

            <Link to="/reader" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-elegant hover:shadow-glow transition-all">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </Link>

            <Link to="/search" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                <Search className="mr-2 h-5 w-5" />
                Search Scripture
              </Button>
            </Link>

            <Link to="/wmb-sermons" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                <MessageSquare className="mr-2 h-5 w-5" />
                WMB Sermons
              </Button>
            </Link>
          </div>

          {/* Daily Quote */}
          <div className="w-full max-w-5xl mt-12 px-2 sm:px-0">
            <DailyQuote />
          </div>

          {/* Recent Verses */}
          <div className="w-full max-w-6xl mt-12 px-2 sm:px-0">
            <RecentBibleVerses />
          </div>

          {/* 3D Flip Tiles Grid - Feature Cards */}
          <div className="w-full max-w-7xl mt-12">
            <FlipTilesGrid autoPlay={true} triggerOnScroll={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
