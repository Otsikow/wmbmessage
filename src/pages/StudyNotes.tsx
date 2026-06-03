import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Search, BookOpen, ChevronRight, Tag, Share2, Printer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StudyNoteContent } from "@/components/study-notes/StudyNoteContent";
import { STUDY_NOTE_TOPICS, type StudyNote } from "@/types/studyNotes";
import { buildExcerpt } from "@/lib/studyNoteFormatter";

function NoteListItem({ note, query }: { note: StudyNote; query: string }) {
  const preview = note.excerpt || buildExcerpt(note.body, 220);
  return (
    <Link to={`/study-notes/${note.id}`} className="block group">
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">
              <Highlight text={note.title} query={query} />
            </CardTitle>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              <Highlight text={note.topic} query={query} />
            </Badge>
            {note.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                <Highlight text={t} query={query} />
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            <Highlight text={preview} query={query} />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 rounded px-0.5">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function StudyNotesList() {
  const [notes, setNotes] = useState<StudyNote[] | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("message_study_notes" as any)
        .select("*")
        .eq("status", "published")
        .order("title", { ascending: true });
      if (cancelled) return;
      if (error) setError(error.message);
      else setNotes((data as unknown as StudyNote[]) || []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    const set = new Set<string>(["All"]);
    notes?.forEach((n) => set.add(n.topic));
    STUDY_NOTE_TOPICS.forEach((t) => set.add(t));
    return Array.from(set);
  }, [notes]);

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (topic !== "All" && n.topic !== topic) return false;
      if (!q) return true;
      const haystack = [
        n.title,
        n.topic,
        n.excerpt || "",
        n.body,
        n.tags.join(" "),
      ]
        .join(" \n ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [notes, query, topic]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Message Study Notes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Study Library
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            A timeless, searchable library of study notes on Bible and Message
            topics — for personal study, sermon preparation, and spiritual growth.
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, scripture (e.g. John 1:1), quote, or keyword…"
            className="h-12 pl-10 text-base"
            aria-label="Search study notes"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {topics.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={topic === t ? "default" : "outline"}
              onClick={() => setTopic(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive">Unable to load study notes: {error}</p>
        )}

        {!notes ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              {query
                ? `No study notes match “${query}”. Try a different keyword.`
                : "No study notes have been published yet. Check back soon."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "note" : "notes"}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((n) => (
                <NoteListItem key={n.id} note={n} query={query} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StudyNoteDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const [note, setNote] = useState<StudyNote | null | undefined>(undefined);
  const [related, setRelated] = useState<StudyNote[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("message_study_notes" as any)
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      const n = (data as unknown as StudyNote) || null;
      setNote(n);
      if (n) {
        const { data: rel } = await supabase
          .from("message_study_notes" as any)
          .select("*")
          .eq("status", "published")
          .eq("topic", n.topic)
          .neq("id", n.id)
          .limit(4);
        if (!cancelled) setRelated(((rel as unknown as StudyNote[]) || []));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onShare = async () => {
    const url = window.location.href;
    if (navigator.share && note) {
      try {
        await navigator.share({ title: note.title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
  };

  if (note === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <main className="container mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton />
        <main className="container mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-2">Study note not found</h1>
          <p className="text-muted-foreground mb-6">
            This note may have been removed or is not yet published.
          </p>
          <Button onClick={() => navigate("/study-notes")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton />
      <main className="container mx-auto max-w-3xl px-4 py-6 md:py-10 print:py-0">
        <div className="mb-6 print:hidden">
          <Link
            to="/study-notes"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> All study notes
          </Link>
        </div>

        <header className="mb-6">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Tag className="h-3 w-3" /> {note.topic}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {note.title}
          </h1>
          {note.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {note.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2 print:hidden">
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
            </Button>
          </div>
        </header>

        <StudyNoteContent body={note.body} />

        {related.length > 0 && (
          <section className="mt-12 border-t pt-8 print:hidden">
            <h2 className="text-xl font-semibold mb-4">Related study notes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/study-notes/${r.id}`}
                  className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition"
                >
                  <div className="font-medium text-foreground">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.topic}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function StudyNotes() {
  const { id } = useParams<{ id: string }>();
  if (id) return <StudyNoteDetail id={id} />;
  return <StudyNotesList />;
}
