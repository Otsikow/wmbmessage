import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, MapPin, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SermonReference {
  id: string;
  sermon_title: string;
  sermon_date: string;
  sermon_location: string;
  paragraph_number: number;
  paragraph_content: string;
  reference_note?: string | null;
}

export interface BibleVerseData {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  isJesusWords?: boolean;
}

interface CrossReferenceCardProps {
  bibleVerse: BibleVerseData;
  sermonReference: SermonReference;
  onAddToNotes?: () => void;
  className?: string;
}

export default function CrossReferenceCard({
  bibleVerse,
  sermonReference,
  onAddToNotes,
  className,
}: CrossReferenceCardProps) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-4", className)}>
      {/* Left Column - Bible Verse */}
      <Card variant="glass" className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle glass className="text-sm font-semibold text-primary flex items-center gap-2">
            <span className="glass-icon">
              <BookOpen className="h-4 w-4" />
            </span>
            {bibleVerse.book} {bibleVerse.chapter}:{bibleVerse.verse}
          </CardTitle>
          <Badge variant="secondary" className="w-fit text-xs bg-primary/20 border-primary/30 backdrop-blur-sm">
            Bible Verse
          </Badge>
        </CardHeader>
        <CardContent glass className="space-y-3">
          <p
            className={cn(
              "reader-typography text-sm leading-relaxed",
              bibleVerse.isJesusWords && "text-jesus-words font-medium"
            )}
          >
            {bibleVerse.text}
          </p>
        </CardContent>
      </Card>

      {/* Right Column - Sermon Reference */}
      <Card variant="glass" className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-3">
          <CardTitle glass className="text-sm font-semibold">
            {sermonReference.sermon_title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1 border-white/20 bg-white/5 backdrop-blur-sm">
              <Calendar className="h-3 w-3" />
              {sermonReference.sermon_date}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1 border-white/20 bg-white/5 backdrop-blur-sm">
              <MapPin className="h-3 w-3" />
              {sermonReference.sermon_location}
            </Badge>
          </div>
        </CardHeader>
        <CardContent glass className="space-y-3">
          <p className="text-sm leading-relaxed">
            {sermonReference.paragraph_content}
          </p>
          <div className="text-xs opacity-70">
            Paragraph {sermonReference.paragraph_number}
          </div>
          {sermonReference.reference_note && (
            <div className="flex gap-2 items-start p-2 bg-white/[0.04] backdrop-blur-sm rounded-[12px] border border-white/10">
              <StickyNote className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-70" />
              <p className="text-xs italic opacity-80">
                {sermonReference.reference_note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add to Notes Button */}
      {onAddToNotes && (
        <div className="md:col-span-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddToNotes}
            className="gap-2 border-white/20 hover:border-white/30 hover:bg-white/10"
          >
            <StickyNote className="h-4 w-4" />
            Add to Study Notes
          </Button>
        </div>
      )}
    </div>
  );
}
