import { useState, useRef, useEffect } from "react";
import { Bold, Italic, List, Save, X } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: {
    source_type: "bible" | "sermon";
    source_id: string;
    title?: string;
    content: string;
    verse_reference?: string | null;
  }) => void;
  initialData?: {
    source_type: "bible" | "sermon";
    source_id: string;
    title?: string;
    content: string;
    verse_reference?: string | null;
  };
  sourceType?: "bible" | "sermon";
  sourceId?: string;
}

export function NoteEditor({
  open,
  onOpenChange,
  onSave,
  initialData,
  sourceType = "bible",
  sourceId = "",
}: NoteEditorProps) {
  const [sourceReference, setSourceReference] = useState(sourceId);
  const [selectedSourceType, setSelectedSourceType] = useState<"bible" | "sermon">(sourceType);
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setSourceReference(initialData.source_id);
      setSelectedSourceType(initialData.source_type);
      setTitle(initialData.title || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = initialData.content;
      }
    } else {
      setSourceReference(sourceId);
      setSelectedSourceType(sourceType);
      setTitle("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [initialData, sourceId, sourceType, open]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    if (!editorRef.current) return;

    if (!sourceReference.trim()) {
      toast({
        title: "Reference required",
        description:
          selectedSourceType === "bible"
            ? "Please add a verse reference before saving your note."
            : "Please add a sermon reference before saving your note.",
        variant: "destructive",
      });
      return;
    }

    const content = DOMPurify.sanitize(editorRef.current.innerHTML);
    if (!content.trim()) {
      toast({
        title: "Add note content",
        description: "Write something in the note body before saving.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      source_type: selectedSourceType,
      source_id: sourceReference,
      title: title.trim() || sourceReference,
      content,
      verse_reference: selectedSourceType === "bible" ? sourceReference : null,
    });

    // Reset form
    setSourceReference("");
    setTitle("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form on close
    setSourceReference(sourceId);
    setSelectedSourceType(sourceType);
    setTitle("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Note" : "Add Study Note"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Type Selection */}
          <div>
            <Label>Note Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={selectedSourceType === "bible" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSourceType("bible")}
              >
                Bible Verse
              </Button>
              <Button
                type="button"
                variant={selectedSourceType === "sermon" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSourceType("sermon")}
              >
                Sermon
              </Button>
            </div>
          </div>

          {/* Source Reference */}
          <div>
            <Label htmlFor="source-reference">
              {selectedSourceType === "bible" ? "Verse Reference" : "Sermon Reference"}
            </Label>
            <Input
              id="source-reference"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder={
                selectedSourceType === "bible"
                  ? "e.g., John 3:16"
                  : "e.g., Sermon Title - Para 5"
              }
              className="mt-1"
            />
          </div>

          {/* Note Title */}
          <div>
            <Label htmlFor="note-title">Title (Optional)</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Key insight about faith"
              className="mt-1"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <Label>Note Content</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              {/* Toolbar */}
              <div className="flex gap-1 p-2 border-b bg-muted/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("bold")}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("italic")}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormat("insertUnorderedList")}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                className={cn(
                  "min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none",
                  "prose-p:my-2 prose-ul:my-2 prose-li:my-1"
                )}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use the toolbar to format your notes with bold, italics, and bullet
              points
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
