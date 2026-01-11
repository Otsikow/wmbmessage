import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appendShareAttribution } from "@/lib/share";
import { Link2, Bookmark, Copy, Check, NotebookPen, AudioLines } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  isFocused?: boolean;
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
  isFocused = false
}: VerseCardProps) {
  const {
    toast
  } = useToast();
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
    const verseText = appendShareAttribution(`${book} ${chapter}:${verse.number}\n${verse.text}`);
    try {
      const copiedSuccessfully = await copyToClipboard(verseText);
      if (!copiedSuccessfully) {
        throw new Error("Copy command was unsuccessful");
      }
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: `${book} ${chapter}:${verse.number}`
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
        variant: "destructive"
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
  return <div className={cn(
    "group relative overflow-hidden rounded-[20px] p-4 sm:p-5 cursor-pointer",
    // Glass styling
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-[16px] saturate-[180%]",
    "border border-border/60 dark:border-white/[0.08]",
    "shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
    "dark:drop-shadow-[0_8px_25px_rgba(0,0,0,0.4)]",
    // Transitions
    "transition-all duration-[350ms] ease-out",
    // Highlight colors override glass when present
    highlight ? getHighlightColorClass(highlight.color) : [
      "hover:-translate-y-1 hover:scale-[1.01]",
      "hover:border-border/80 dark:hover:border-white/25",
      "hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)]",
      "dark:hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_12px_35px_rgba(0,0,0,0.5)]"
    ],
    // Focused state
    isFocused && "bg-primary/[0.06] dark:bg-primary/[0.12] border-primary/50 shadow-[0_12px_30px_rgba(59,130,246,0.2)]",
    // Selected state
    isSelected && "ring-2 ring-primary border-primary shadow-lg -translate-y-1 scale-[1.01]"
  )} role="button" aria-pressed={isSelected} aria-label={`${book} ${chapter}:${verse.number} verse card`} tabIndex={0} onClick={handleSelectVerse} onKeyDown={handleKeyDown}>
      {isFocused && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/90 via-primary/50 to-transparent"
          aria-hidden="true"
        />
      )}
      {/* Top edge highlight */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px] bg-gradient-to-r from-transparent via-white/20 to-transparent" 
        aria-hidden="true"
      />
      <div className="grid grid-cols-[auto,1fr] gap-3 sm:gap-4">
        {/* Verse Number */}
        <span className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-wide transition-colors",
          "border border-border/60 dark:border-white/20 bg-white/70 dark:bg-white/[0.08] backdrop-blur-sm",
          "text-foreground/70 dark:text-white/70",
          isFocused && "border-primary/60 text-primary bg-primary/10",
          isSelected && "border-primary text-primary bg-primary/20"
        )}>
          {verse.number}
        </span>

        {/* Verse Content */}
        <div className="flex flex-col gap-3">
          <p className={cn("text-sm sm:text-base leading-relaxed glass-heading", verse.isJesusWords && "text-jesus-words font-medium", fontClass)}>
            {verse.text}
          </p>

          {highlight?.note && <div className="rounded-[12px] border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-2 text-xs italic text-primary/90">
              {highlight.note}
            </div>}

          
        </div>
      </div>
    </div>;
}
