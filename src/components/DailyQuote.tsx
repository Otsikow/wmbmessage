import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

interface DailyQuoteData {
  text: string;
  reference: string;
}

const quotes: DailyQuoteData[] = [
  {
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    reference: "John 3:16",
  },
  {
    text: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13",
  },
  {
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "The LORD is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
  },
  {
    text: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
    reference: "Psalm 46:10",
  },
  {
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reference: "Romans 8:28",
  },
  {
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
    reference: "Isaiah 40:31",
  },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<DailyQuoteData>(quotes[0]);

  useEffect(() => {
    // Get a quote based on the day of the year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    setQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <Card className="p-6 md:p-8 shadow-elegant border-l-4 border-l-primary bg-card/50 backdrop-blur">
      <div className="flex items-start gap-4">
        <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
        <div className="space-y-3 flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            Daily Verse
          </h3>
          <blockquote className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
            "{quote.text}"
          </blockquote>
          <p className="text-sm font-medium text-primary">
            — {quote.reference}
          </p>
        </div>
      </div>
    </Card>
  );
}
