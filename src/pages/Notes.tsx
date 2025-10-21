import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNotes } from "@/hooks/useNotes";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Notes() {
  const navigate = useNavigate();
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    verse_reference: "",
  });

  const handleCreateNote = async () => {
    if (!formData.title.trim()) return;
    
    await createNote({
      title: formData.title,
      content: formData.content,
      verse_reference: formData.verse_reference,
    });
    
    setFormData({ title: "", content: "", verse_reference: "" });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !formData.title.trim()) return;
    
    await updateNote(selectedNote.id, {
      title: formData.title,
      content: formData.content,
      verse_reference: formData.verse_reference,
    });
    
    setFormData({ title: "", content: "", verse_reference: "" });
    setIsEditDialogOpen(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    
    await deleteNote(selectedNote.id);
    setIsDeleteDialogOpen(false);
    setSelectedNote(null);
  };

  const openEditDialog = (note: any) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      verse_reference: note.verse_reference || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (note: any) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full py-6 sm:py-8">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Notes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your study notes and reflections
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0 w-full sm:w-auto" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter note title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="verse_reference">Verse Reference (Optional)</Label>
                    <Input
                      id="verse_reference"
                      value={formData.verse_reference}
                      onChange={(e) => setFormData({ ...formData, verse_reference: e.target.value })}
                      placeholder="e.g., John 3:16"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your notes here..."
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNote}>Create Note</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first study note to get started
              </p>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg">{note.title}</h3>
                        {note.verse_reference && (
                          <p className="text-xs text-primary mt-1">{note.verse_reference}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(note)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {note.content && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                        {note.content}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-verse">Verse Reference (Optional)</Label>
                  <Input
                    id="edit-verse"
                    value={formData.verse_reference}
                    onChange={(e) => setFormData({ ...formData, verse_reference: e.target.value })}
                    placeholder="e.g., John 3:16"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your notes here..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateNote}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this note? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteNote}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
