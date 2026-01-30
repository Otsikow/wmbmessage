import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  Sparkles,
  MapPin,
} from "lucide-react";
import DailyQuote from "@/components/DailyQuote";
import RecentBibleVerses from "@/components/RecentBibleVerses";
import { AnimatedBackground } from "@/components/ui/animated-background";
import logoImage from "@/assets/logo-hero.png";

export default function Hero() {
  return (
    <section className="relative">
      {/* Top Hero Section with Video + Animated Background */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center">
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
          {/* Premium gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />
        </div>

        {/* Animated Background Layer - Gradient Blobs + Particles */}
        <AnimatedBackground 
          className="z-[1] opacity-60"
          cursorReactive={true}
          showParticles={true}
          blobCount={4}
          parallaxIntensity={0.3}
        />

        <div className="container responsive-section relative z-10 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up px-2 sm:px-0">
            {/* Logo with floating animation */}
            <div className="mb-4 float">
              <img
                src={logoImage}
                alt="MessageGuide Logo"
                className="h-20 sm:h-24 md:h-32 w-auto mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Title with gradient text */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground drop-shadow-lg">
                Your Guide to the
                <span className="block text-gradient-gold mt-2 drop-shadow-lg">Message of The Hour</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto drop-shadow-md">
                Read the Bible, explore William Marrion Branham's sermons, and
                discover connections between scripture and prophetic messages.
              </p>
            </div>

            {/* Premium Glass Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl pt-6">
              <Link to="/plans" className="w-full">
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 glass glass-neon-primary bg-transparent hover:bg-transparent text-foreground hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 ease-out rounded-glass group"
                >
                  <Sparkles className="mr-2 h-5 w-5 flex-shrink-0 icon-neon group-hover:scale-110 transition-transform" />
                  <span className="truncate">Bible Reading Plans</span>
                </Button>
              </Link>

              <Link to="/reader" className="w-full">
                <Button 
                  size="lg" 
                  className="w-full h-12 sm:h-14 glass glass-neon-primary bg-transparent hover:bg-transparent text-foreground hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 ease-out rounded-glass group"
                >
                  <BookOpen className="mr-2 h-5 w-5 flex-shrink-0 icon-neon group-hover:scale-110 transition-transform" />
                  <span className="truncate">Start Reading</span>
                </Button>
              </Link>

              <Link to="/search" className="w-full">
                <Button 
                  size="lg" 
                  className="w-full h-12 sm:h-14 glass glass-neon-primary bg-transparent hover:bg-transparent text-foreground hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 ease-out rounded-glass group"
                >
                  <Search className="mr-2 h-5 w-5 flex-shrink-0 icon-neon group-hover:scale-110 transition-transform" />
                  <span className="truncate">Search Scripture</span>
                </Button>
              </Link>

              <Link to="/message-churches" className="w-full">
                <Button 
                  size="lg" 
                  className="w-full h-12 sm:h-14 glass glass-neon-secondary bg-transparent hover:bg-transparent text-foreground hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 ease-out rounded-glass group"
                >
                  <MapPin className="mr-2 h-5 w-5 flex-shrink-0 icon-neon group-hover:scale-110 transition-transform" />
                  <span className="truncate">Browse Churches</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Below Video - With Mesh Gradient Background */}
      <div className="relative bg-background">
        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />
        
        <div className="container responsive-section relative z-10 py-12 space-y-12">
          {/* Daily Quote */}
          <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
            <DailyQuote />
          </div>

          {/* Recent Verses */}
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-0">
            <RecentBibleVerses />
          </div>

        </div>
      </div>
    </section>
  );
}
