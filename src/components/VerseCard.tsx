import { useState } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Link2,
  Bookmark,
  Copy,
  Check,
  NotebookPen,
  AudioLines,
} from "lucide-react";
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
  onAddNote?: (verseNumber: number, event: MouseEvent<HTMLButtonElement>) => void;
  onSermonCrossRef?: (verseNumber: number) => void;
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
  onAddNote,
  onSermonCrossRef,
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
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm transition-all",
        highlight
          ? getHighlightColorClass(highlight.color)
          : "hover:border-primary/50 hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary shadow-lg",
        "backdrop-blur-sm"
      )}
    >
      <div className="grid grid-cols-[auto,1fr] gap-3 sm:gap-4">
        {/* Verse Number */}
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors",
            isSelected && "border-primary text-primary"
          )}
        >
          {verse.number}
        </span>

        {/* Verse Content */}
        <div className="flex flex-col gap-3">
          <p
            className={cn(
              "text-sm sm:text-base leading-relaxed text-foreground/90",
              verse.isJesusWords && "text-jesus-words font-medium",
              fontClass
            )}
          >
            {verse.text}
          </p>

          {highlight?.note && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs italic text-primary/90">
              {highlight.note}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-border/60 pt-3 text-muted-foreground sm:justify-between">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
              {book} {chapter}:{verse.number}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <HighlightMenu
                onHighlight={(color, noteValue) => onHighlight(verse.number, color, noteValue)}
                onRemoveHighlight={
                  highlight ? () => onRemoveHighlight(verse.number) : undefined
                }
                currentColor={highlight?.color}
                currentNote={highlight?.note}
              />

              {onAddNote && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(event) => onAddNote(verse.number, event)}
                  title="Add study note"
                >
                  <NotebookPen className="h-3.5 w-3.5" />
                </Button>
              )}

              {onSermonCrossRef && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSermonCrossRef(verse.number)}
                  title="View sermon references"
                >
                  <AudioLines className="h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isBookmarked && "text-primary")}
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

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewCrossReferences(verse.number)}
                title="View cross references"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
                title="Copy verse"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
