import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  onSelect?: (verseNumber: number) => void;
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
  onSelect,
  fontClass = "",
}: VerseCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      if (typeof document !== "undefined") {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error("Fallback copy failed:", error);
    }

    return false;
  };

  const handleCopy = async () => {
    const verseText = `${book} ${chapter}:${verse.number}\n${verse.text}`;

    try {
      const copiedSuccessfully = await copyToClipboard(verseText);

      if (!copiedSuccessfully) {
        throw new Error("Copy command was unsuccessful");
      }

      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `${book} ${chapter}:${verse.number}`,
      });

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectVerse = () => {
    onSelect?.(verse.number);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectVerse();
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm transition-all cursor-pointer",
        highlight
          ? getHighlightColorClass(highlight.color)
          : "hover:border-primary/50 hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary shadow-lg",
        "backdrop-blur-sm"
      )}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${book} ${chapter}:${verse.number} verse card`}
      tabIndex={0}
      onClick={handleSelectVerse}
      onKeyDown={handleKeyDown}
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
              "text-sm sm:text-base leading-relaxed text-foreground",
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

          {isSelected && (
            <div className="flex flex-wrap items-center justify-end gap-1.5 pt-3 text-muted-foreground">
              <span className="sr-only">
                {book} {chapter}:{verse.number}
              </span>

              <div className="flex flex-wrap items-center gap-1.5 transition-all duration-200">
                <HighlightMenu
                  onHighlight={(color, noteValue) => onHighlight(verse.number, color, noteValue)}
                  onRemoveHighlight={
                    highlight ? () => onRemoveHighlight(verse.number) : undefined
                  }
                  currentColor={highlight?.color}
                  currentNote={highlight?.note}
                />

                {onAddNote && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddNote(verse.number, event);
                        }}
                      >
                        <NotebookPen className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Add study note</TooltipContent>
                  </Tooltip>
                )}

                {onSermonCrossRef && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSermonCrossRef(verse.number);
                        }}
                      >
                        <AudioLines className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      View sermon references
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", isBookmarked && "text-primary")}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleBookmark(verse.number);
                      }}
                    >
                      <Bookmark
                        className={cn(
                          "h-3.5 w-3.5",
                          isBookmarked && "fill-current"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isBookmarked ? "Remove bookmark" : "Bookmark verse"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewCrossReferences(verse.number);
                      }}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">View cross references</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopy();
                      }}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {copied ? "Copied" : "Copy verse"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
