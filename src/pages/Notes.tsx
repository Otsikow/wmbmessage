import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserNotes } from "@/hooks/useNotes";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteCard, UserNote } from "@/components/NoteCard";
import { Badge } from "@/components/ui/badge";

export default function Notes() {
  const navigate = useNavigate();
  const { userNotes, loading, createUserNote, updateUserNote, deleteUserNote } = useUserNotes();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | string>("all");

  // Group notes by tags and source type
  const groupedNotes = useMemo(() => {
    const groups: { [key: string]: UserNote[] } = {
      all: userNotes,
      bible: userNotes.filter((note) => note.tags.includes("Bible")),
      message: userNotes.filter((note) => note.tags.includes("Message")),
      prayer: userNotes.filter((note) => note.tags.includes("Prayer")),
      personal: userNotes.filter((note) => note.tags.includes("Personal")),
      untagged: userNotes.filter((note) => note.tags.length === 0),
      bibleVerses: userNotes.filter((note) => note.source_type === "bible"),
      sermonNotes: userNotes.filter((note) => note.source_type === "sermon"),
    };
    return groups;
  }, [userNotes]);

  const handleSaveNote = async (noteData: {
    source_type: "bible" | "sermon";
    source_id: string;
    content: string;
    tags: string[];
  }) => {
    if (selectedNote) {
      await updateUserNote(selectedNote.id, noteData);
    } else {
      await createUserNote(noteData);
    }
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  const handleEditNote = (note: UserNote) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    await deleteUserNote(id);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const filteredNotes = useMemo(() => {
    if (selectedFilter === "all") return userNotes;
    return groupedNotes[selectedFilter] || [];
  }, [selectedFilter, userNotes, groupedNotes]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/more")}
                className="md:hidden shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Study Notes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your personal Bible and Message reflections
                </p>
              </div>
            </div>
            <Button
              className="shrink-0 w-full sm:w-auto"
              size="lg"
              onClick={handleNewNote}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Total Notes</p>
              <p className="text-2xl font-bold">{userNotes.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Bible Verses</p>
              <p className="text-2xl font-bold">
                {groupedNotes.bibleVerses?.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Sermon Notes</p>
              <p className="text-2xl font-bold">
                {groupedNotes.sermonNotes?.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Tagged</p>
              <p className="text-2xl font-bold">
                {userNotes.length - (groupedNotes.untagged?.length || 0)}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedFilter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("all")}
              >
                All ({userNotes.length})
              </Badge>
              <Badge
                variant={selectedFilter === "bible" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("bible")}
              >
                Bible ({groupedNotes.bible?.length || 0})
              </Badge>
              <Badge
                variant={selectedFilter === "message" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("message")}
              >
                Message ({groupedNotes.message?.length || 0})
              </Badge>
              <Badge
                variant={selectedFilter === "prayer" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("prayer")}
              >
                Prayer ({groupedNotes.prayer?.length || 0})
              </Badge>
              <Badge
                variant={selectedFilter === "personal" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("personal")}
              >
                Personal ({groupedNotes.personal?.length || 0})
              </Badge>
            </div>
          </div>

          {/* Notes List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedFilter === "all"
                  ? "No Notes Yet"
                  : "No Notes in This Category"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedFilter === "all"
                  ? "Create your first study note to get started"
                  : "Add notes with this tag to see them here"}
              </p>
              {selectedFilter === "all" && (
                <Button onClick={handleNewNote}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Dialog */}
      <NoteEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onSave={handleSaveNote}
        initialData={
          selectedNote
            ? {
                source_type: selectedNote.source_type,
                source_id: selectedNote.source_id,
                content: selectedNote.content,
                tags: selectedNote.tags,
              }
            : undefined
        }
      />
    </div>
  );
}
