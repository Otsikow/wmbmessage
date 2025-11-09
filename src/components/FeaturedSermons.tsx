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
    <Card className="h-full border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-background via-background/95 to-background">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{sermon.series}</span>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight leading-tight text-foreground">
          {sermon.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {sermon.date}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground/90">{sermon.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {sermon.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Headphones className="h-4 w-4 text-secondary" />
            <span>Listen or read in MessageGuide</span>
          </div>
          <Button asChild size="sm" variant="outline" className="shadow-none">
            <Link to="/wmb-sermons" aria-label={`Open ${sermon.title} sermon`}>
              View Sermon
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="container space-y-10">
        <div className="flex flex-col gap-6 text-center md:text-left md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Featured Sermons</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Dive deeper into the Message of the Hour
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
              Curated sermons from William Marrion Branham to inspire your study, explore prophetic insights, and strengthen your faith journey.
            </p>
          </div>
          <div>
            <Button asChild variant="secondary" className="shadow-sm">
              <Link to="/wmb-sermons">Browse All Sermons</Link>
            </Button>
          </div>
        </div>

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
