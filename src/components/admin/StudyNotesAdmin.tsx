import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit3, Trash2, Eye, FileText, EyeOff, Tag, ImagePlus, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { StudyNoteContent } from "@/components/study-notes/StudyNoteContent";
import { STUDY_NOTE_TOPICS, type StudyNote, type StudyNoteStatus } from "@/types/studyNotes";
import { buildExcerpt } from "@/lib/studyNoteFormatter";

interface FormState {
  id?: string;
  title: string;
  topic: string;
  body: string;
  tags: string;
  status: StudyNoteStatus;
}

const EMPTY_FORM: FormState = {
  title: "",
  topic: "General",
  body: "",
  tags: "",
  status: "draft",
};

export default function StudyNotesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudyNoteStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viewNote, setViewNote] = useState<StudyNote | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large (max 8MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `study-notes/${user?.id ?? "anon"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("user-uploads").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      setUploading(false);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("user-uploads").getPublicUrl(path);
    const url = pub.publicUrl;
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const snippet = `\n\n![${alt}](${url})\n\n`;
    const ta = bodyRef.current;
    if (ta) {
      const start = ta.selectionStart ?? form.body.length;
      const end = ta.selectionEnd ?? form.body.length;
      const next = form.body.slice(0, start) + snippet + form.body.slice(end);
      setForm((f) => ({ ...f, body: next }));
      setTimeout(() => {
        ta.focus();
        const pos = start + snippet.length;
        ta.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setForm((f) => ({ ...f, body: f.body + snippet }));
    }
    setUploading(false);
    toast({ title: "Image inserted" });
  };

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("message_study_notes" as any)
      .select("*")
      .order("title", { ascending: true });
    if (error) {
      toast({ title: "Failed to load notes", description: error.message, variant: "destructive" });
    } else {
      setNotes((data as unknown as StudyNote[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (!q) return true;
      return [n.title, n.topic, n.body, n.excerpt || "", n.tags.join(" ")]
        .join(" \n ")
        .toLowerCase()
        .includes(q);
    });
  }, [notes, query, statusFilter]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (n: StudyNote) => {
    setForm({
      id: n.id,
      title: n.title,
      topic: n.topic,
      body: n.body,
      tags: n.tags.join(", "),
      status: n.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (status: StudyNoteStatus) => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({
        title: "Title and body are required",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = {
      title: form.title.trim(),
      topic: form.topic || "General",
      body: form.body,
      excerpt: buildExcerpt(form.body, 220),
      tags,
      status,
      author_id: user?.id ?? null,
    };
    const { error } = form.id
      ? await supabase.from("message_study_notes" as any).update(payload).eq("id", form.id)
      : await supabase.from("message_study_notes" as any).insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Note ${status === "published" ? "published" : "saved as draft"}` });
    setDialogOpen(false);
    fetchNotes();
  };

  const togglePublish = async (n: StudyNote) => {
    const next: StudyNoteStatus = n.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("message_study_notes" as any)
      .update({ status: next })
      .eq("id", n.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: next === "published" ? "Published" : "Unpublished" });
      fetchNotes();
    }
  };

  const handleDelete = async (n: StudyNote) => {
    if (!confirm(`Delete “${n.title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("message_study_notes" as any).delete().eq("id", n.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Note deleted" });
      fetchNotes();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Message Study Notes
            </CardTitle>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> New Study Note
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, topic, scripture, quote, keyword…"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | StudyNoteStatus)}
            >
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes found.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {filtered.map((n) => (
                <li key={n.id} className="flex flex-wrap items-start justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{n.title}</span>
                      <Badge
                        variant={n.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {n.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{n.topic}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {n.excerpt || buildExcerpt(n.body, 180)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewNote(n)} title="View post">
                      <Eye className="h-4 w-4" />
                      <span className="ml-1 text-xs">View</span>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(n)} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => togglePublish(n)} title={n.status === "published" ? "Unpublish" : "Publish"}>
                      {n.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="ml-1 text-xs">
                        {n.status === "published" ? "Unpublish" : "Publish"}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(n)}
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Study Note" : "New Study Note"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="sn-title">Title</Label>
              <Input
                id="sn-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., The Godhead Revealed"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Topic / Category</Label>
                <Select
                  value={form.topic}
                  onValueChange={(v) => setForm({ ...form, topic: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_NOTE_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="mt-2"
                  placeholder="Or type a new category…"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sn-tags">Tags / Keywords (comma separated)</Label>
                <Input
                  id="sn-tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="bride, token, communion"
                />
              </div>
            </div>

            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Label htmlFor="sn-body">Full Study Note Text</Label>
                <Textarea
                  id="sn-body"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Paste your entire study note here. Headings, Bible references (John 3:16), Brother Branham quotes, lists, key points and prayers will be auto-formatted."
                  className="min-h-[400px] font-mono text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Tips: ALL-CAPS or short Title-Case lines become headings. Lines
                  starting with a Bible reference become scripture boxes. Lines in
                  quotes followed by “Brother Branham” become quote cards. Use
                  “Key Point:”, “Prayer:”, “Reflection:” to create highlighted
                  sections.
                </p>
              </TabsContent>
              <TabsContent value="preview">
                <div className="rounded-md border bg-background p-5">
                  {form.body.trim() ? (
                    <StudyNoteContent body={form.body} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleSave("draft")} disabled={saving}>
              Save Draft
            </Button>
            <Button onClick={() => handleSave("published")} disabled={saving}>
              {form.status === "published" ? "Update & Keep Published" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewNote} onOpenChange={(open) => !open && setViewNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8 text-2xl">{viewNote?.title}</DialogTitle>
          </DialogHeader>
          {viewNote && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={viewNote.status === "published" ? "default" : "secondary"}>
                  {viewNote.status}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {viewNote.topic}
                </Badge>
                {viewNote.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
              <div className="rounded-md border bg-background p-5">
                <StudyNoteContent body={viewNote.body} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setViewNote(null)}>Close</Button>
            {viewNote && (
              <Button
                onClick={() => {
                  const n = viewNote;
                  setViewNote(null);
                  openEdit(n);
                }}
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
