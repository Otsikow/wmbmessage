import { useMemo, useState } from "react";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { CalendarDays, Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DailyReading {
  verse: {
    text: string;
    reference: string;
  };
  message: {
    text: string;
    reference: string;
  };
}

const dailyReadings: DailyReading[] = [
  {
    verse: {
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reference: "John 3:16",
    },
    message: {
      text: "The greatest act of love was God giving Himself for us; when that love strikes your heart, it changes your whole being.",
      reference: "William Branham — 1960-0417 \"Faith Is The Substance\"",
    },
  },
  {
    verse: {
      text: "I can do all things through Christ which strengtheneth me.",
      reference: "Philippians 4:13",
    },
    message: {
      text: "If He ever called you to do a thing, He will make a way for it. Quit looking at your weakness and look at His promise.",
      reference: "William Branham — 1956-0219 \"Being Led Of The Holy Spirit\"",
    },
  },
  {
    verse: {
      text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
      reference: "Proverbs 3:5-6",
    },
    message: {
      text: "When you surrender your thinking to God, then He takes charge of the path ahead and leads every step you make.",
      reference: "William Branham — 1957-0804 \"As I Was With Moses\"",
    },
  },
  {
    verse: {
      text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
      reference: "Psalm 23:1-2",
    },
    message: {
      text: "The Shepherd is leading you; just keep your eyes on Him. He knows the quiet waters and the green pastures your soul needs.",
      reference: "William Branham — 1953-0217 \"Expectations\"",
    },
  },
  {
    verse: {
      text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
      reference: "Isaiah 40:31",
    },
    message: {
      text: "Waiting on God is not doing nothing; it's letting your faith take hold until you can rise above the storm like an eagle.",
      reference: "William Branham — 1956-0101 \"Why Are People So Tossed About\"",
    },
  },
  {
    verse: {
      text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
      reference: "Romans 8:28",
    },
    message: {
      text: "When you put God first, even the things you don't understand will fit together and show that His hand was guiding all along.",
      reference: "William Branham — 1955-0806E \"A Man Running From The Presence Of The Lord\"",
    },
  },
  {
    verse: {
      text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
      reference: "Lamentations 3:22-23",
    },
    message: {
      text: "Every sunrise is God reminding you that His mercy is fresh. Yesterday is gone; walk into today knowing His grace is enough.",
      reference: "William Branham — 1964-0320 \"He Was To Pass This Way\"",
    },
  },
  {
    verse: {
      text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.",
      reference: "John 14:27",
    },
    message: {
      text: "When Christ steps into the heart, He brings a peace the world never gave and can never take away from the believer.",
      reference: "William Branham — 1959-1217 \"What Was The Holy Ghost Given For?\"",
    },
  },
  {
    verse: {
      text: "Draw nigh to God, and he will draw nigh to you.",
      reference: "James 4:8",
    },
    message: {
      text: "If you will make the first step toward Him, God will make a thousand steps toward you. He longs for fellowship with His children.",
      reference: "William Branham — 1955-1007 \"Expectations\"",
    },
  },
  {
    verse: {
      text: "The joy of the LORD is your strength.",
      reference: "Nehemiah 8:10",
    },
    message: {
      text: "When you know He has redeemed you, joy wells up inside, and that joy becomes the very strength you need to keep going.",
      reference: "William Branham — 1953-1201 \"God's Provided Way\"",
    },
  },
];

function getReadingForDate(date: Date): DailyReading {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayIndex = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(startOfYear)
  );

  const normalizedIndex = ((dayIndex % dailyReadings.length) + dailyReadings.length) % dailyReadings.length;
  return dailyReadings[normalizedIndex];
}

export default function DailyQuote() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

  const reading = useMemo(() => getReadingForDate(selectedDate), [selectedDate]);

  return (
    <Card className="p-5 sm:p-6 md:p-8 shadow-elegant border border-primary/20 bg-card/60 backdrop-blur">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4 items-start text-left">
              <Quote className="h-8 w-8 sm:h-9 sm:w-9 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-primary/80">
                  Daily Quote
                </p>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore today&apos;s scripture reading alongside a message quote from William Branham. Use the calendar to revisit previous days.
                </p>
              </div>
            </div>

            <div className="flex sm:justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full border border-border bg-background/80 shadow-sm hover:bg-primary/10"
                    aria-label="Open calendar"
                  >
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Select a date to view its quote
                    </h4>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(startOfDay(date))}
                      defaultMonth={selectedDate}
                      weekStartsOn={0}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-foreground">Message Insight</h4>
            <blockquote className="text-base md:text-lg leading-relaxed text-foreground/90 italic">
              “{reading.message.text}”
            </blockquote>
            <p className="text-sm text-muted-foreground font-medium">
              — {reading.message.reference}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-foreground">Scripture Reading</h4>
            <blockquote className="reader-typography text-base md:text-lg leading-relaxed text-foreground/90">
              “{reading.verse.text}”
            </blockquote>
            <p className="text-sm font-semibold text-primary">
              — {reading.verse.reference}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
