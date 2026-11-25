import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  BookOpenText,
  CalendarCheck,
  MapPin,
  Music,
  Search,
} from "lucide-react";
import DailyQuote from "@/components/DailyQuote";
import RecentBibleVerses from "@/components/RecentBibleVerses";
import logoImage from "@/assets/logo-hero.png";

const secondaryActions = [
  { to: "/study-notes", label: "Study Notes", icon: BookOpenText },
  { to: "/songs", label: "Song Book", icon: Music },
  { to: "/plans", label: "Reading Plans", icon: CalendarCheck },
  { to: "/message-churches", label: "Find a Church", icon: MapPin },
];

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative flex items-center overflow-hidden bg-gradient-to-b from-primary/5 to-background md:min-h-[75svh]">
        <div className="pointer-events-none absolute inset-0 hidden md:motion-safe:block" aria-hidden="true">
          <video autoPlay loop muted playsInline preload="none" className="h-full w-full object-cover">
            <source src="/videos/bible-hero-video.mov" type="video/quicktime" media="(min-width: 768px) and (prefers-reduced-motion: no-preference)" />
            <source src="/videos/bible-hero-video.mov" type="video/mp4" media="(min-width: 768px) and (prefers-reduced-motion: no-preference)" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />
        </div>

        <div className="home-content relative z-10 w-full py-7 sm:py-12 lg:py-20">
          <div className="flex flex-col items-center gap-5 text-left md:gap-8 md:text-center">
            <img
              src={logoImage}
              alt=""
              className="hidden h-20 w-auto drop-shadow-lg md:block lg:h-24"
            />

            <div className="w-full space-y-3 md:space-y-4">
              <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
                Your Guide to the
                <span className="block text-foreground md:mt-2 md:italic md:text-amber-950 md:dark:text-gradient-gold">Message of the Hour</span>
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg md:mx-auto md:text-foreground/90">
                Read the Bible and study William Marrion Branham’s sermons.
              </p>
            </div>

            <nav aria-label="Explore MessageGuide" className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-3 sm:p-4 md:bg-background/90 md:shadow-xl md:backdrop-blur-md">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Button asChild size="lg" className="h-12 justify-start rounded-xl px-4 text-base dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                  <Link to="/bible">
                    <BookOpen aria-hidden="true" />
                    Read the Bible
                    <ArrowRight aria-hidden="true" className="ml-auto" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 justify-start rounded-xl border-primary/35 bg-card px-4 text-base">
                  <Link to="/messages">
                    <Search aria-hidden="true" className="text-primary" />
                    Search Messages
                    <ArrowRight aria-hidden="true" className="ml-auto" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 border-t border-border pt-2 sm:grid-cols-4">
                {secondaryActions.map(({ to, label, icon: Icon }) => (
                  <Button key={to} asChild variant="ghost" className="h-auto min-h-11 justify-start whitespace-normal rounded-lg px-2 text-left sm:justify-center">
                    <Link to={to}>
                      <Icon aria-hidden="true" className="text-primary" />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Content Below Video - With Mesh Gradient Background */}
      <div className="relative bg-background">
        {/* Subtle mesh gradient overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />
        
        <div className="home-content relative z-10 space-y-8 py-8 sm:space-y-10 sm:py-12">
          <DailyQuote />
          <RecentBibleVerses />
        </div>
      </div>
    </section>
  );
}
