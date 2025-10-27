import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CrossReferenceCard from "@/components/CrossReferenceCard";
import { useSermonCrossReferences } from "@/hooks/useSermonCrossReferences";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SermonCrossReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: string;
  chapter: number;
  verse?: number;
}

export default function SermonCrossReferenceModal({
  open,
  onOpenChange,
  book,
  chapter,
  verse,
}: SermonCrossReferenceModalProps) {
  const { toast } = useToast();
  const { addNote } = useNotes();
  const [isAddingNote, setIsAddingNote] = useState(false);

  const {
    sermonCrossReferences,
    loading,
    error,
    currentIndex,
    currentReference,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
  } = useSermonCrossReferences(book, chapter, verse);

  const handleAddToNotes = async () => {
    if (!currentReference) return;

    setIsAddingNote(true);
    try {
      const { bibleVerse, sermonReference } = currentReference;
      const verseRef = `${bibleVerse.book} ${bibleVerse.chapter}:${bibleVerse.verse}`;
      
      const noteContent = `## Cross-Reference: ${verseRef}

**Bible Verse:**
> ${bibleVerse.text}

**Sermon Reference:**
**${sermonReference.sermon_title}**
${sermonReference.sermon_date} - ${sermonReference.sermon_location}
Paragraph ${sermonReference.paragraph_number}

${sermonReference.paragraph_content}

${sermonReference.reference_note ? `\n**Note:** ${sermonReference.reference_note}` : ''}
`;

      await addNote({
        title: `Cross-Reference: ${verseRef}`,
        content: noteContent,
        verse_reference: verseRef,
      });

      toast({
        title: "Added to Study Notes",
        description: `Cross-reference for ${verseRef} has been saved to your notes.`,
      });
    } catch (err) {
      console.error("Error adding note:", err);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const title = verse
    ? `Cross-References for ${book} ${chapter}:${verse}`
    : `Cross-References for ${book} ${chapter}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Related Bible verses and corresponding William Branham sermon quotes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading cross-references...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : sermonCrossReferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <BookMarked className="h-16 w-16 text-muted-foreground/30" />
              <div className="space-y-1 text-center">
                <p className="text-muted-foreground font-medium">
                  No sermon cross-references found
                </p>
                <p className="text-xs text-muted-foreground/70">
                  This verse hasn't been linked to any William Branham sermons yet
                </p>
              </div>
            </div>
          ) : currentReference ? (
            <div className="space-y-6">
              {/* Reference Counter */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>
                  Reference {currentIndex + 1} of {sermonCrossReferences.length}
                </span>
              </div>

              {/* Cross-Reference Card */}
              <CrossReferenceCard
                bibleVerse={currentReference.bibleVerse}
                sermonReference={currentReference.sermonReference}
                onAddToNotes={handleAddToNotes}
              />

              {/* Navigation Controls */}
              {sermonCrossReferences.length > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={!hasPrevious}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {/* Page Indicators */}
                  <div className="flex gap-1">
                    {sermonCrossReferences.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          index === currentIndex
                            ? "w-8 bg-primary"
                            : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        aria-label={`Go to reference ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    disabled={!hasNext}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Loading state for adding note */}
              {isAddingNote && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding to notes...</span>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
