import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseVerseReference, formatReference, ParsedReference } from "@/lib/verseParser";
import { useBibleData } from "@/hooks/useBibleData";
import { Loader2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrossReferenceViewerProps {
  onNavigate?: (book: string, chapter: number) => void;
}

export default function CrossReferenceViewer({ onNavigate }: CrossReferenceViewerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [references, setReferences] = useState<ParsedReference[]>([]);
  const [error, setError] = useState("");

  const handleAddReference = () => {
    setError("");
    const parsed = parseVerseReference(searchInput);
    
    if (!parsed) {
      setError("Invalid reference format. Try: John 3:16 or Genesis 1:1-3");
      return;
    }
    
    // Check if reference already exists
    const exists = references.some(ref => 
      ref.book === parsed.book && 
      ref.chapter === parsed.chapter && 
      ref.startVerse === parsed.startVerse
    );
    
    if (exists) {
      setError("This reference is already added");
      return;
    }
    
    setReferences([...references, parsed]);
    setSearchInput("");
  };

  const handleRemoveReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddReference();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter reference (e.g., John 3:16 or Rom 8:28-30)"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setError("");
            }}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleAddReference} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Examples: "John 3:16", "Genesis 1:1-3", "Romans 8:28"
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        {references.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Add verse references to view them here
          </div>
        ) : (
          <div className="space-y-6">
            {references.map((ref, index) => (
              <ReferenceDisplay
                key={index}
                reference={ref}
                onRemove={() => handleRemoveReference(index)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface ReferenceDisplayProps {
  reference: ParsedReference;
  onRemove: () => void;
  onNavigate?: (book: string, chapter: number) => void;
}

function ReferenceDisplay({ reference, onRemove, onNavigate }: ReferenceDisplayProps) {
  const { verses, loading, error } = useBibleData(reference.book, reference.chapter);

  const displayVerses = verses.filter(v => {
    if (!reference.startVerse) return true;
    if (!reference.endVerse) return v.number === reference.startVerse;
    return v.number >= reference.startVerse && v.number <= reference.endVerse;
  });

  return (
    <div className="space-y-2 pb-6 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-primary cursor-pointer hover:underline"
            onClick={() => onNavigate?.(reference.book, reference.chapter)}>
          {formatReference(reference)}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div className="space-y-2">
          {displayVerses.map((verse) => (
            <div key={verse.number} className="flex gap-2 text-sm">
              <span className="font-semibold text-primary min-w-[1.5rem]">
                {verse.number}
              </span>
              <p className={cn(
                "leading-relaxed",
                verse.isJesusWords && "text-jesus-words font-medium"
              )}>
                {verse.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
