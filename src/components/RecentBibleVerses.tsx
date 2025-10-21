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
  }, []);

  if (recentVerses.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Recent Bible Verses</h2>
        <Card className="p-8 text-center border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Your recently viewed verses will appear here
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Recent Bible Verses</h2>
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recentVerses.map((verse) => (
            <CarouselItem key={verse.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card className="p-6 border-border/50 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {verse.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
