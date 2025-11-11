import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar,
  MapPin,
  BookOpen,
  FileText,
  StickyNote,
} from "lucide-react";
import churchInteriorImage from "@/assets/church-interior.jpg";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { NoteEditor } from "@/components/NoteEditor";
import { useUserNotes } from "@/hooks/useNotes";
import BackButton from "@/components/BackButton";
import {
  SermonSummary,
  useSermonSummaries,
} from "@/hooks/useSermonSummaries";
import { useEngagement } from "@/contexts/EngagementContext";

export default function WMBSermons() {
  const navigate = useNavigate();
  const { createUserNote } = useUserNotes();
  const { sermons, loading } = useSermonSummaries();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [selectedSermonForNote, setSelectedSermonForNote] = useState<
    SermonSummary | undefined
  >(undefined);
  const { recordActivity } = useEngagement();

  useEffect(() => {
    recordActivity("library-explore", {
      description: "Explored sermon library",
    });
  }, [recordActivity]);

  const filteredSermons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return sermons;
    }

    return sermons.filter((sermon) => {
      const dateText = new Date(sermon.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return [
        sermon.title,
        sermon.location,
        sermon.excerpt,
        dateText,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [sermons, searchQuery]);

  const handleAddSermonNote = (sermon: SermonSummary, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSermonForNote(sermon);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = async (noteData: {
    source_type: "bible" | "sermon";
    source_id: string;
    content: string;
    tags: string[];
    sermon_title?: string | null;
  }) => {
    await createUserNote({
      ...noteData,
      sermon_title:
        noteData.sermon_title ?? selectedSermonForNote?.title ?? null,
    });
    recordActivity("note-created", {
      description: noteData.sermon_title ?? selectedSermonForNote?.title ?? "Sermon note",
    });
    setIsNoteEditorOpen(false);
    setSelectedSermonForNote(undefined);
  };

  const handleViewCrossReferences = (
    sermon: SermonSummary,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    navigate(`/cross-references?query=${encodeURIComponent(sermon.title)}`);
  };

  const handleOpenSermon = (sermon: SermonSummary) => {
    navigate(`/message-reader?sermon=${sermon.id}`);
  };

  const handleNoteEditorOpenChange = (open: boolean) => {
    setIsNoteEditorOpen(open);
    if (!open) {
      setSelectedSermonForNote(undefined);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const renderSermonCard = (sermon: SermonSummary) => {
    const crossRefLabel = sermon.crossReferenceCount === 1
      ? "verse link"
      : "verse links";
    const paragraphLabel = sermon.paragraphCount === 1
      ? "paragraph"
      : "paragraphs";

    return (
      <div
        key={sermon.id}
        className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleOpenSermon(sermon)}
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
            <h3 className="font-semibold text-base sm:text-lg leading-tight">
              {sermon.title}
            </h3>
            <Badge variant="secondary" className="self-start text-xs shrink-0">
              <BookOpen className="h-3 w-3 mr-1" />
              {sermon.crossReferenceCount} {crossRefLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDate(sermon.date)}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{sermon.location}</span>
            </div>
            {sermon.paragraphCount > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>
                    {sermon.paragraphCount} {paragraphLabel}
                  </span>
                </div>
              </>
            )}
          </div>

          {sermon.excerpt && (
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {sermon.excerpt}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={(event) => handleViewCrossReferences(sermon, event)}
            >
              View Cross-References
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => handleAddSermonNote(sermon, event)}
              className="shrink-0"
            >
              <StickyNote className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={churchInteriorImage} alt="Church Interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <BackButton />
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">WMB Sermons</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Explore William Marrion Branham's teachings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full py-6 sm:py-8 pb-24 md:pb-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-sm mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input 
                placeholder="Search sermons..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base" 
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((index) => (
                  <Card key={index} className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : filteredSermons.length > 0 ? (
              filteredSermons.map(renderSermonCard)
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No sermons found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search to find a sermon.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Note Editor Dialog */}
      <NoteEditor
        open={isNoteEditorOpen}
        onOpenChange={handleNoteEditorOpenChange}
        onSave={handleSaveNote}
        sourceType="sermon"
        sourceId={selectedSermonForNote?.title ?? ""}
        initialData={
          selectedSermonForNote
            ? {
                source_type: "sermon",
                source_id: selectedSermonForNote.title,
                content: "",
                tags: ["Sermon"],
                sermon_title: selectedSermonForNote.title,
              }
            : undefined
        }
      />

      <Footer />
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  );
}
