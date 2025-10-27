import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link2, Bookmark, Copy, Check } from "lucide-react";
import HighlightMenu from "@/components/HighlightMenu";
import { getHighlightColorClass } from "@/hooks/useHighlights";
import { useToast } from "@/hooks/use-toast";

interface VerseCardProps {
  book: string;
  chapter: number;
  verse: {
    number: number;
    text: string;
    isJesusWords?: boolean;
  };
  highlight?: {
    color: string;
    note?: string;
  };
  isBookmarked?: boolean;
  isSelected?: boolean;
  onHighlight: (verseNumber: number, color: string, note?: string) => void;
  onRemoveHighlight: (verseNumber: number) => void;
  onToggleBookmark: (verseNumber: number) => void;
  onViewCrossReferences: (verseNumber: number) => void;
  fontClass?: string;
}

export default function VerseCard({
  book,
  chapter,
  verse,
  highlight,
  isBookmarked = false,
  isSelected = false,
  onHighlight,
  onRemoveHighlight,
  onToggleBookmark,
  onViewCrossReferences,
  fontClass = "",
}: VerseCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const verseText = `${book} ${chapter}:${verse.number}\n${verse.text}`;
    
    try {
      await navigator.clipboard.writeText(verseText);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `${book} ${chapter}:${verse.number}`,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "group relative flex gap-2 sm:gap-3 rounded-lg p-3 sm:p-4 transition-all",
        "hover:shadow-sm border",
        highlight ? getHighlightColorClass(highlight.color) : "bg-card hover:bg-muted/30",
        isSelected && "ring-2 ring-primary border-primary shadow-md",
        "border-border/50"
      )}
    >
      {/* Verse Number */}
      <span
        className={cn(
          "text-xs sm:text-sm font-bold min-w-[1.5rem] sm:min-w-[2rem] text-right transition-colors pt-0.5",
          isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        )}
      >
        {verse.number}
      </span>

      {/* Verse Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm sm:text-base leading-relaxed",
            verse.isJesusWords && "text-jesus-words font-medium",
            fontClass
          )}
        >
          {verse.text}
        </p>

        {/* Highlight Note */}
        {highlight?.note && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground italic border-l-2 border-primary/30">
            {highlight.note}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Highlight Button */}
        <HighlightMenu
          onHighlight={(color, note) => onHighlight(verse.number, color, note)}
          onRemoveHighlight={
            highlight ? () => onRemoveHighlight(verse.number) : undefined
          }
          currentColor={highlight?.color}
          currentNote={highlight?.note}
        />

        {/* Cross Reference Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewCrossReferences(verse.number)}
          title="View cross references"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>

        {/* Bookmark Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7",
            isBookmarked && "text-primary"
          )}
          onClick={() => onToggleBookmark(verse.number)}
          title={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
        >
          <Bookmark
            className={cn(
              "h-3.5 w-3.5",
              isBookmarked && "fill-current"
            )}
          />
        </Button>

        {/* Copy Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
          title="Copy verse"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
