import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  StickyNote,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/useNotes";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useToast } from "@/hooks/use-toast";
import { SermonParagraph as SermonParagraphType } from "@/hooks/useSermons";

interface SermonParagraphProps {
  paragraph: SermonParagraphType;
  sermonId: string;
  sermonTitle: string;
}

export default function SermonParagraph({
  paragraph,
  sermonId,
  sermonTitle,
}: SermonParagraphProps) {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const { createNote } = useNotes();
  const { isBookmarked, toggleBookmark } = useBookmarks(sermonId);
  const { toast } = useToast();

  const bookmarked = isBookmarked(sermonId, paragraph.paragraph_number);

  const handleToggleBookmark = async () => {
    await toggleBookmark(sermonId, paragraph.paragraph_number);
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      });
      return;
    }

    const reference = `${sermonTitle} - Para. ${paragraph.paragraph_number}`;
    const result = await createNote({
      title: noteTitle,
      content: noteContent || paragraph.content,
      verse_reference: reference,
    });

    if (result) {
      setNoteTitle("");
      setNoteContent("");
      setIsNoteDialogOpen(false);
    }
  };

  return (
    <div
      id={`para-${paragraph.paragraph_number}`}
      className="group relative bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-all"
    >
      {/* Paragraph Number Badge */}
      <Badge
        variant="outline"
        className="absolute -top-3 left-4 bg-background px-3 py-1"
      >
        <span className="text-xs font-mono">{paragraph.paragraph_number}</span>
      </Badge>

      {/* Paragraph Content */}
      <p className="text-sm sm:text-base leading-relaxed mb-4 pt-2">
        {paragraph.content}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={bookmarked ? "default" : "outline"}
          size="sm"
          onClick={handleToggleBookmark}
          className="text-xs"
        >
          <Bookmark className={`h-3 w-3 mr-1 ${bookmarked ? "fill-current" : ""}`} />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>

        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <StickyNote className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
              <DialogDescription>
                Add a note for paragraph {paragraph.paragraph_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Note Title</label>
                <Input
                  placeholder="Enter note title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note Content</label>
                <Textarea
                  placeholder="Enter your thoughts..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  Referenced Paragraph:
                </p>
                <p className="text-xs line-clamp-3">{paragraph.content}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>Create Note</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            // Navigate to Bible reader with cross-reference
            toast({
              title: "Coming soon",
              description: "Scripture comparison feature is in development",
            });
          }}
        >
          <BookOpen className="h-3 w-3 mr-1" />
          Compare Scripture
        </Button>
      </div>
    </div>
  );
}
