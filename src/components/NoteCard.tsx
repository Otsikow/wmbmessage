import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2, BookOpen, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import DOMPurify from "@/lib/dompurify";

export interface UserNote {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  title: string;
  content: string;
  verse_reference: string | null;
  sermon_title?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteCardProps {
  note: UserNote;
  onEdit: (note: UserNote) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const sanitizedContent = DOMPurify.sanitize(note.content);

  const handleDelete = () => {
    onDelete(note.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card variant="glass" className="p-4 sm:p-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="glass-icon text-primary">
                  {note.source_type === "bible" ? (
                    <BookOpen className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </span>
                <h3 className="font-semibold text-base sm:text-lg glass-heading">
                  {note.title || note.source_id}
                </h3>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs glass-body">
                {formatDistanceToNow(new Date(note.updated_at), {
                  addSuffix: true,
                })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(note)}
                title="Edit note"
                className="hover:bg-white/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                title="Delete note"
                className="hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div
            className="text-sm glass-body prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
