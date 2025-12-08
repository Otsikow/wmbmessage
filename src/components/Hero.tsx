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
import logoImage from "@/assets/logo-hero.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/bible-hero-video.mov" type="video/quicktime" />
          <source src="/videos/bible-hero-video.mov" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      </div>

      <div className="container responsive-section relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up px-2 sm:px-0">
          {/* Logo */}
          <div className="mb-4">
            <img
              src={logoImage}
              alt="MessageGuide Logo"
              className="h-20 sm:h-24 md:h-32 w-auto mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground drop-shadow-lg">
              Your Guide to the
              <span className="block text-primary mt-2 drop-shadow-lg">Message of The Hour</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto drop-shadow-md">
              Read the Bible, explore William Marrion Branham's sermons, and
              discover connections between scripture and prophetic messages.
            </p>
          </div>

          {/* Glass Action Buttons */}
          <div className="flex flex-col w-full max-w-3xl gap-4 sm:flex-row sm:flex-wrap sm:justify-center pt-4">
            <Link to="/plans" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Bible Reading Plans
              </Button>
            </Link>

            <Link to="/reader" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full bg-primary/80 backdrop-blur-md border border-primary/30 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Start Reading
              </Button>
            </Link>

            <Link to="/search" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-foreground shadow-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Scripture
              </Button>
            </Link>

            <Link to="/wmb-sermons" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full bg-secondary/80 backdrop-blur-md border border-secondary/30 text-secondary-foreground shadow-lg hover:bg-secondary/90 transition-all duration-300"
              >
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
