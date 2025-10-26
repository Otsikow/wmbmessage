import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { parseVerseReference, formatReference, ParsedReference } from "@/lib/verseParser";
import { useBibleData } from "@/hooks/useBibleData";
import { useCrossReferences, CrossReference, UserCrossReference } from "@/hooks/useCrossReferences";
import { Loader2, X, Plus, BookOpen, User, Link2Icon, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CrossReferenceViewerProps {
  onNavigate?: (book: string, chapter: number) => void;
  currentBook?: string;
  currentChapter?: number;
  currentVerse?: number;
}

export default function CrossReferenceViewer({ 
  onNavigate,
  currentBook,
  currentChapter,
  currentVerse 
}: CrossReferenceViewerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [manualReferences, setManualReferences] = useState<ParsedReference[]>([]);
  const [error, setError] = useState("");

  // Fetch automatic cross-references if we have a current verse
  const { 
    crossReferences, 
    userCrossReferences, 
    loading: crossRefsLoading 
  } = useCrossReferences(
    currentBook || "",
    currentChapter || 1,
    currentVerse
  );

  const showAutomaticTab = currentBook && currentChapter && currentVerse;

  const handleAddReference = () => {
    setError("");
    const parsed = parseVerseReference(searchInput);
    
    if (!parsed) {
      setError("Invalid reference format. Try: John 3:16 or Genesis 1:1-3");
      return;
    }
    
    // Check if reference already exists
    const exists = manualReferences.some(ref => 
      ref.book === parsed.book && 
      ref.chapter === parsed.chapter && 
      ref.startVerse === parsed.startVerse
    );
    
    if (exists) {
      setError("This reference is already added");
      return;
    }
    
    setManualReferences([...manualReferences, parsed]);
    setSearchInput("");
  };

  const handleRemoveReference = (index: number) => {
    setManualReferences(manualReferences.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddReference();
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Context Display */}
      {showAutomaticTab && (
        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            Showing cross-references for{" "}
            <span className="font-semibold">
              {currentBook} {currentChapter}:{currentVerse}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={showAutomaticTab ? "automatic" : "manual"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automatic" disabled={!showAutomaticTab}>
            <Link2Icon className="h-4 w-4 mr-2" />
            Related Verses
          </TabsTrigger>
          <TabsTrigger value="manual">
            <BookOpen className="h-4 w-4 mr-2" />
            Look Up
          </TabsTrigger>
        </TabsList>

        {/* Automatic Cross-References Tab */}
        <TabsContent value="automatic" className="space-y-4">
          {crossRefsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {crossReferences.length === 0 && userCrossReferences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-2">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    No cross-references found for this verse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adding your own in the "Look Up" tab
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Public Cross-References */}
                  {crossReferences.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">Biblical Cross-References</h4>
                        <Badge variant="secondary" className="ml-auto">
                          {crossReferences.length}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {crossReferences.map((ref) => (
                          <AutomaticReferenceDisplay
                            key={ref.id}
                            reference={ref}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Cross-References */}
                  {userCrossReferences.length > 0 && (
                    <>
                      {crossReferences.length > 0 && <Separator />}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Your Cross-References</h4>
                          <Badge variant="secondary" className="ml-auto">
                            {userCrossReferences.length}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {userCrossReferences.map((ref) => (
                            <AutomaticReferenceDisplay
                              key={ref.id}
                              reference={ref}
                              onNavigate={onNavigate}
                              isUserReference
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>

        {/* Manual Lookup Tab */}
        <TabsContent value="manual" className="space-y-4">
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
            {manualReferences.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-2">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">
                  Add verse references to compare them
                </p>
                <p className="text-xs text-muted-foreground">
                  Type a reference above and click + to add
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {manualReferences.map((ref, index) => (
                  <ManualReferenceDisplay
                    key={index}
                    reference={ref}
                    onRemove={() => handleRemoveReference(index)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AutomaticReferenceDisplayProps {
  reference: CrossReference | UserCrossReference;
  onNavigate?: (book: string, chapter: number) => void;
  isUserReference?: boolean;
}

function AutomaticReferenceDisplay({ 
  reference, 
  onNavigate,
  isUserReference 
}: AutomaticReferenceDisplayProps) {
  const { verses, loading, error } = useBibleData(reference.to_book, reference.to_chapter);

  const displayVerses = verses.filter(v => {
    if (reference.to_verse_end) {
      return v.number >= reference.to_verse && v.number <= reference.to_verse_end;
    }
    return v.number === reference.to_verse;
  });

  const getRelationshipBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      related: { label: "Related", variant: "secondary" },
      parallel: { label: "Parallel", variant: "default" },
      quotation: { label: "Quotation", variant: "outline" },
      fulfillment: { label: "Fulfillment", variant: "default" },
      contrast: { label: "Contrast", variant: "secondary" },
    };
    return variants[type] || variants.related;
  };

  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle 
              className="text-base font-semibold text-primary cursor-pointer hover:underline flex items-center gap-2"
              onClick={() => onNavigate?.(reference.to_book, reference.to_chapter)}
            >
              {reference.to_book} {reference.to_chapter}:{reference.to_verse}
              {reference.to_verse_end && reference.to_verse_end !== reference.to_verse && 
                `-${reference.to_verse_end}`
              }
              <ExternalLink className="h-3 w-3" />
            </CardTitle>
            {reference.relationship_type && (
              <Badge 
                variant={getRelationshipBadge(reference.relationship_type).variant}
                className="text-xs"
              >
                {getRelationshipBadge(reference.relationship_type).label}
              </Badge>
            )}
          </div>
        </div>
        {reference.notes && (
          <CardDescription className="text-xs italic">
            {reference.notes}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

interface ManualReferenceDisplayProps {
  reference: ParsedReference;
  onRemove: () => void;
  onNavigate?: (book: string, chapter: number) => void;
}

function ManualReferenceDisplay({ reference, onRemove, onNavigate }: ManualReferenceDisplayProps) {
  const { verses, loading, error } = useBibleData(reference.book, reference.chapter);

  const displayVerses = verses.filter(v => {
    if (!reference.startVerse) return true;
    if (!reference.endVerse) return v.number === reference.startVerse;
    return v.number >= reference.startVerse && v.number <= reference.endVerse;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            className="text-base font-semibold text-primary cursor-pointer hover:underline flex items-center gap-2"
            onClick={() => onNavigate?.(reference.book, reference.chapter)}
          >
            {formatReference(reference)}
            <ExternalLink className="h-3 w-3" />
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
