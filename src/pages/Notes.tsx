import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Loader2, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserNotes } from "@/hooks/useNotes";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteCard, UserNote } from "@/components/NoteCard";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/BackButton";

export default function Notes() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userNotes,
    loading,
    createUserNote,
    updateUserNote,
    deleteUserNote,
    refetch,
    syncOfflineNotes,
    isSupabaseConfigured,
  } = useUserNotes();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | string>("all");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Group notes by source type
  const groupedNotes = useMemo(() => {
    const groups: { [key: string]: UserNote[] } = {
      all: userNotes,
      bibleVerses: userNotes.filter((note) => note.source_type === "bible"),
      sermonNotes: userNotes.filter((note) => note.source_type === "sermon"),
    };
    return groups;
  }, [userNotes]);

  const handleSaveNote = async (noteData: {
    source_type: "bible" | "sermon";
    source_id: string;
    title?: string;
    content: string;
    verse_reference?: string | null;
  }) => {
    if (selectedNote) {
      await updateUserNote(selectedNote.id, noteData);
    } else {
      await createUserNote({
        ...noteData,
        title: noteData.title || noteData.source_id,
      });
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

  const handleNewNote = useCallback(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to save notes.",
      });
      navigate("/auth/sign-in");
      return;
    }
    setSelectedNote(null);
    setIsEditorOpen(true);
  }, [navigate, toast, user]);

  useEffect(() => {
    const state = location.state as { openEditor?: boolean } | null;
    if (state?.openEditor) {
      handleNewNote();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [handleNewNote, location.pathname, location.state, navigate]);

  const handleSyncNotes = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to sync your notes.",
      });
      return;
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Sync unavailable",
        description: "Supabase is not configured. Add your keys to sync notes.",
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Reconnect to the internet to sync your notes.",
      });
      return;
    }

    setIsSyncing(true);
    const { count, error } = await syncOfflineNotes();
    await refetch();
    setIsSyncing(false);

    if (error) {
      toast({
        title: "Sync failed",
        description: "We couldn't sync your offline notes. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (count === 0) {
      toast({
        title: "You're all caught up",
        description: "No offline notes were waiting to sync.",
      });
      return;
    }

    toast({
      title: "Notes synced",
      description: `Synced ${count} offline note${count === 1 ? "" : "s"}.`,
    });
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
              <BackButton fallbackPath="/more" />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Study Notes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your personal Bible and Message reflections
                </p>
              </div>
            </div>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
              <Button
                className="shrink-0 w-full sm:w-auto"
                size="lg"
                variant="outline"
                onClick={handleSyncNotes}
                disabled={isSyncing || !isOnline}
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isSyncing ? "Syncing..." : "Sync Notes"}
              </Button>
              <Button
                className="shrink-0 w-full sm:w-auto"
                size="lg"
                onClick={handleNewNote}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
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
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {userNotes.filter(n => new Date(n.created_at).getMonth() === new Date().getMonth()).length}
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
                variant={selectedFilter === "bibleVerses" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("bibleVerses")}
              >
                Bible Verses ({groupedNotes.bibleVerses?.length || 0})
              </Badge>
              <Badge
                variant={selectedFilter === "sermonNotes" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedFilter("sermonNotes")}
              >
                Sermons ({groupedNotes.sermonNotes?.length || 0})
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
                source_type: selectedNote.source_type as "bible" | "sermon",
                source_id: selectedNote.source_id,
                title: selectedNote.title,
                content: selectedNote.content,
                verse_reference: selectedNote.verse_reference,
              }
            : undefined
        }
      />
    </div>
  );
}
