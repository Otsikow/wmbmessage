import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BookOpen } from "lucide-react";
import { useRecentVerses } from "@/hooks/useRecentVerses";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function RecentBibleVerses() {
  const { recentVerses, addRecentVerse } = useRecentVerses();
  const [hasRevealed, setHasRevealed] = useState(false);

  // Add sample verses on first load
  useEffect(() => {
    if (recentVerses.length === 0) {
      const sampleVerses = [
        {
          book: "John",
          chapter: 3,
          verse: 16,
          text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        },
        {
          book: "Psalm",
          chapter: 23,
          verse: 1,
          text: "The LORD is my shepherd; I shall not want.",
        },
        {
          book: "Proverbs",
          chapter: 3,
          verse: 5,
          text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
        },
        {
          book: "Romans",
          chapter: 8,
          verse: 28,
          text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
        },
        {
          book: "Philippians",
          chapter: 4,
          verse: 13,
          text: "I can do all things through Christ which strengtheneth me.",
        },
      ];
      
      sampleVerses.forEach(verse => addRecentVerse(verse));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recentVerses.length === 0) {
      return;
    }

    const timer = setTimeout(() => setHasRevealed(true), 100);

    return () => clearTimeout(timer);
  }, [recentVerses.length]);

  if (recentVerses.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gradient-blue-purple">Recent Bible Verses</h2>
        <Card variant="glass" className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 icon-neon" />
          <p className="text-muted-foreground">
            Your recently viewed verses will appear here
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -inset-x-10 -top-8 -bottom-6 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.06),transparent_30%),radial-gradient(circle_at_55%_82%,rgba(99,102,241,0.06),transparent_42%)] blur-3xl opacity-80 animate-[pulse_7s_ease-in-out_infinite]" />
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gradient-blue-purple">Recent Bible Verses</h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 transition-[transform] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform">
          {recentVerses.map((verse, index) => (
            <CarouselItem
              key={verse.id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <Card
                className={cn(
                  "group relative h-full overflow-hidden rounded-[22px] border border-border/50 bg-card/80 dark:bg-card/60 p-6 shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-[1.5px]",
                  "transition-[transform,opacity,filter,box-shadow] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity,filter]",
                  "hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:border-primary/40",
                  hasRevealed
                    ? "opacity-100 blur-0 translate-y-0 scale-100 shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                    : "opacity-0 blur-[14px] translate-y-[30px] scale-[0.96]",
                )}
                style={{ transitionDelay: `${index * 180}ms` }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0.6),rgba(59,130,246,0.06))] dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.15),rgba(30,41,59,0.4),rgba(59,130,246,0.1))] opacity-0 blur-sm transition-opacity duration-700 ease-out group-hover:opacity-80 dark:group-hover:opacity-60" />
                <div className="relative z-10 flex h-full flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    <h3 className="font-semibold text-lg text-foreground">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </h3>
                  </div>
                  <p className="reader-typography text-base md:text-[17px] leading-relaxed text-muted-foreground/90 transition-transform duration-200 ease-out group-hover:-translate-y-[3px] line-clamp-4">
                    {verse.text}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground/80">
                    {new Date(verse.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
