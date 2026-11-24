import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BookOpen } from "lucide-react";
import { useRecentVerses } from "@/hooks/useRecentVerses";
import { useEffect } from "react";

export default function RecentBibleVerses() {
  const { recentVerses, addRecentVerse } = useRecentVerses();

  // Add sample verses on first load
  useEffect(() => {
    if (recentVerses.length === 0) {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const sampleVerses = [
        {
          book: "John",
          chapter: 3,
          verse: 16,
          text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
          timestamp: now - 4 * dayMs,
        },
        {
          book: "Psalm",
          chapter: 23,
          verse: 1,
          text: "The LORD is my shepherd; I shall not want.",
          timestamp: now - 3 * dayMs,
        },
        {
          book: "Proverbs",
          chapter: 3,
          verse: 5,
          text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
          timestamp: now - 2 * dayMs,
        },
        {
          book: "Romans",
          chapter: 8,
          verse: 28,
          text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
          timestamp: now - dayMs,
        },
        {
          book: "Philippians",
          chapter: 4,
          verse: 13,
          text: "I can do all things through Christ which strengtheneth me.",
          timestamp: now,
        },
      ];
      
      sampleVerses.forEach(verse => addRecentVerse(verse));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <section aria-labelledby="recent-verses-heading">
      <Carousel opts={{ align: "start" }}>
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2 id="recent-verses-heading" className="text-xl font-bold text-gradient-blue-purple sm:text-3xl">
            Recent Bible Verses
          </h2>
          <div className="flex shrink-0 gap-2">
            <CarouselPrevious
              className="static h-11 w-11 translate-y-0"
              aria-label="Previous verses"
            />
            <CarouselNext
              className="static h-11 w-11 translate-y-0"
              aria-label="Next verses"
            />
          </div>
        </div>
        <CarouselContent>
          {recentVerses.map((verse) => (
            <CarouselItem key={verse.id} className="sm:basis-1/2 lg:basis-1/3">
              <Card className="flex h-full flex-col items-center gap-3 border-border/60 bg-card/80 p-5 text-center sm:p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold sm:text-lg">
                    {verse.book} {verse.chapter}:{verse.verse}
                  </h3>
                </div>
                <p className="reader-typography line-clamp-4 text-base leading-relaxed text-muted-foreground">
                  {verse.text}
                </p>
                <p className="mt-auto pt-1 text-xs font-medium text-muted-foreground">
                  {new Date(verse.timestamp).toLocaleDateString()}
                </p>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
