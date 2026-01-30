import { Link } from "react-router-dom";
import { CalendarDays, Headphones, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const featuredSermons = [
  {
    title: "The Unveiling of God",
    series: "Jeffersonville Special Meetings",
    date: "June 14, 1964",
    excerpt:
      "Explore how Christ is revealed to the Bride in the closing hours of the Gentile dispensation and discover the call to deeper revelation.",
    tags: ["Revelation", "Christ", "Prophecy"],
  },
  {
    title: "The Rapture",
    series: "Evening Light Revival",
    date: "December 4, 1965",
    excerpt:
      "A prophetic look at the catching away of the Bride, outlining the threefold mystery and our preparation for His coming.",
    tags: ["Second Coming", "Hope", "Preparation"],
  },
  {
    title: "The Token",
    series: "Passover Convention",
    date: "September 1, 1963",
    excerpt:
      "A heartfelt call to apply the Token in every home, emphasizing the personal experience with the Holy Spirit in this hour.",
    tags: ["Holy Spirit", "Family", "Consecration"],
  },
  {
    title: "Christ Is the Mystery of God Revealed",
    series: "Seven Seals Series",
    date: "July 28, 1963",
    excerpt:
      "Unpack the hidden mystery laid out before the foundation of the world and the believer's place in the Body of Christ.",
    tags: ["Mystery", "Identity", "Seven Seals"],
  },
];

const FeaturedSermons = () => {
  const renderCard = (sermon: (typeof featuredSermons)[number]) => (
    <Card
      variant="glass"
      hoverable
      className="group h-full overflow-hidden border-white/15 bg-white/[0.08] shadow-glass-subtle"
    >
      <CardHeader className="space-y-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-3 text-sm glass-body">
          <div className="flex items-center gap-3">
            <span className="glass-icon text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-medium tracking-wide text-xs uppercase text-foreground/70">
              {sermon.series}
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
            <CalendarDays className="h-3.5 w-3.5" />
            {sermon.date}
          </span>
        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight leading-tight glass-heading">
          {sermon.title}
        </CardTitle>

        <CardDescription
          glass
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide sm:hidden"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {sermon.date}
        </CardDescription>
      </CardHeader>

      <CardContent glass className="flex h-full flex-col gap-5 pt-5">
        <p className="text-sm leading-relaxed glass-body text-pretty">{sermon.excerpt}</p>

        <div className="flex flex-wrap gap-2">
          {sermon.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-sm glass-body">
            <span className="glass-icon text-secondary">
              <Headphones className="h-4 w-4" />
            </span>
            <span className="text-pretty">Listen or read in MessageGuide</span>
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="w-full shadow-none border-white/25 hover:border-white/40 hover:bg-white/10 sm:w-auto"
          >
            <Link to="/wmb-sermons" aria-label={`Open ${sermon.title} sermon`}>
              View Sermon
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-muted/30" />

      <div className="container relative z-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col gap-6 text-center md:text-left md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
              Featured Sermons
            </p>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient-blue-purple">
              Dive deeper into the Message of the Hour
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              Curated sermons from William Marrion Branham to inspire your study, explore prophetic
              insights, and strengthen your faith journey.
            </p>
          </div>

          <div>
            <Button
              asChild
              variant="secondary"
              className="bg-primary text-primary-foreground hover:bg-primary-hover hover:scale-105 transition-transform duration-300 font-medium shadow-md"
            >
              <Link to="/wmb-sermons">Browse All Sermons</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel opts={{ align: "start" }} className="relative">
            <CarouselContent>
              {featuredSermons.map((sermon) => (
                <CarouselItem key={sermon.title} className="pt-2 pb-6">
                  {renderCard(sermon)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredSermons.map((sermon) => (
            <div key={sermon.title} className="h-full">
              {renderCard(sermon)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSermons;
