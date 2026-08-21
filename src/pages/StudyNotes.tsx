import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, ChevronRight, ChevronLeft, Tag, Share2, Printer, ArrowLeft, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StudyNoteContent } from "@/components/study-notes/StudyNoteContent";
import { STUDY_NOTE_TOPICS, type StudyNote } from "@/types/studyNotes";
import { buildExcerpt, extractScriptureRefs, extractFirstImageUrl } from "@/lib/studyNoteFormatter";
import { useToast } from "@/hooks/use-toast";
import { buildSeriesNavigation, buildTopicRecommendations } from "@/lib/studyNoteSeries";
import { useStudyNoteSearch, type StudyNoteSummary } from "@/hooks/useStudyNoteSearch";

const APP_BASE_URL = "https://messageguide.org";
const DEFAULT_SHARE_IMAGE = `${APP_BASE_URL}/logo-512.png`;

function buildShareUrl(slugOrId: string): string {
  return `${APP_BASE_URL}/study-notes/${encodeURIComponent(slugOrId)}`;
}

function safeDecode(value: string): string {
  let decoded = value;
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function extractStudyNoteLookupKey(rawValue: string): string {
  let raw = safeDecode(rawValue).trim();

  const embeddedStudyNotePath = raw.match(
    /(?:https?:\/\/(?:www\.)?messageguide\.org)?\/study-notes\/(.+)$/i,
  );
  if (embeddedStudyNotePath?.[1]) raw = embeddedStudyNotePath[1];

  raw = raw.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
  const parts = raw.split(/[\/\s]+/).filter(Boolean);
  const nestedIndex = parts.findIndex((part) => part.toLowerCase() === "study-notes");
  const key = nestedIndex >= 0 ? parts[nestedIndex + 1] : parts[0];

  return (key || "").replace(/[^\w-]+$/g, "").toLowerCase();
}

function normalizeImageUrl(src: string | null): string {
  if (!src) return DEFAULT_SHARE_IMAGE;
  try {
    return new URL(src, APP_BASE_URL).toString();
  } catch {
    return DEFAULT_SHARE_IMAGE;
  }
}

function fileSafeTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "messageguide-study-note"
  );
}

async function buildShareImageFile(imageUrl: string, title: string): Promise<File | null> {
  if (imageUrl === DEFAULT_SHARE_IMAGE) return null;

  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;

    const extension = blob.type.split("/")[1]?.split("+")[0] || "jpg";
    return new File([blob], `${fileSafeTitle(title)}.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
}

function NoteListItem({ note, query }: { note: StudyNoteSummary; query: string }) {
  const preview = note.excerpt || "";
  const slug = note.slug || note.id;
  return (
    <Link to={`/study-notes/${slug}`} className="block group">
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
  const terms = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as string[];
    const words = q.split(/\s+/).filter((w) => w.length > 1);
    return Array.from(new Set([q, ...words])).sort((a, b) => b.length - a.length);
  }, [query]);

  if (terms.length === 0) return <>{text}</>;

  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(re);
  const lowered = new Set(terms.map((t) => t.toLowerCase()));

  return (
    <>
      {parts.map((p, i) =>
        lowered.has(p.toLowerCase()) ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function StudyNotesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("search") ?? "";
  const urlTopic = searchParams.get("topic") ?? "all";

  const [query, setQuery] = useState(urlQuery);
  const topic = urlTopic === "all" ? "All" : urlTopic;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keep the URL in sync with the (debounced) query so refreshes/links work.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (query.trim()) next.set("search", query.trim());
      else next.delete("search");
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setTopic = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "All") next.delete("topic");
    else next.set("topic", value);
    setSearchParams(next, { replace: true });
  };

  const { notes, loading, error, isSearching, allTopics } = useStudyNoteSearch({
    query,
    topic,
    debounceMs: 300,
  });

  const topics = useMemo(() => {
    const set = new Set<string>(allTopics);
    STUDY_NOTE_TOPICS.forEach((t) => set.add(t));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allTopics]);

  const results = notes ?? [];
  const trimmedQuery = query.trim();

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

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
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                clearSearch();
              }
            }}
            placeholder="Search all study notes — title, topic, scripture (e.g. John 1:1), quote, or keyword…"
            className="h-12 pl-10 pr-12 text-base [&::-webkit-search-cancel-button]:appearance-none"
            aria-label="Search all study notes"
            aria-describedby="study-notes-result-count"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile: horizontal scrollable topic pills */}
        <div
          className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide sm:hidden"
          aria-label="Filter study notes by topic"
        >
          {topics.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={topic === t ? "default" : "outline"}
              onClick={() => setTopic(t)}
              className="shrink-0 rounded-full text-xs h-8 px-3"
              aria-pressed={topic === t}
            >
              {t === "All" ? "All Topics" : t}
            </Button>
          ))}
        </div>

        {/* Desktop: compact filter toolbar */}
        <div className="mb-4 hidden sm:flex sm:items-center sm:gap-3 h-10">
          <label htmlFor="topic-select" className="text-sm font-medium text-foreground">
            Topic
          </label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic-select" className="w-[220px] h-9 text-sm" aria-label="Filter by topic">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "All" ? "All Topics" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {topics.length - 1} topics
          </span>
        </div>

        {error && (
          <p className="text-sm text-destructive">Unable to load study notes: {error}</p>
        )}

        <p
          id="study-notes-result-count"
          aria-live="polite"
          className="mb-3 text-sm text-muted-foreground"
        >
          {loading
            ? "Searching…"
            : isSearching
              ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${trimmedQuery}”${
                  topic !== "All" ? ` in ${topic}` : ""
                }`
              : `${results.length} ${results.length === 1 ? "note" : "notes"}${
                  topic !== "All" ? ` in ${topic}` : ""
                }`}
        </p>

        {loading && notes === null ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              {isSearching
                ? `No study notes found for “${trimmedQuery}”${topic !== "All" ? ` in ${topic}` : ""}.`
                : "No study notes have been published yet. Check back soon."}
            </p>
            {isSearching && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  Clear search
                </Button>
                {topic !== "All" && (
                  <Button size="sm" onClick={() => setTopic("All")}>
                    Search all topics
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((n) => (
              <NoteListItem key={n.id} note={n} query={trimmedQuery} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StudyNoteDetail({ idOrSlug }: { idOrSlug: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [note, setNote] = useState<StudyNote | null | undefined>(undefined);
  const [related, setRelated] = useState<StudyNote[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Normalize malformed copied share strings back to the real slug.
      // Handles appended titles/descriptions, extra path segments, and pasted
      // full MessageGuide URLs after /study-notes/.
      const key = extractStudyNoteLookupKey(idOrSlug);

      if (!key) {
        if (!cancelled) setNote(null);
        return;
      }

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          key,
        );
      const base = () =>
        supabase
          .from("message_study_notes" as any)
          .select("*")
          .eq("status", "published");

      let { data } = isUuid
        ? await base().eq("id", key).maybeSingle()
        : await base().eq("slug", key).maybeSingle();

      // Fallback: prefix match on slug (recovers truncated / trailing-text URLs).
      if (!data && !isUuid && key) {
        const { data: pref } = await base()
          .ilike("slug", `${key}%`)
          .order("slug", { ascending: true })
          .limit(1)
          .maybeSingle();
        data = pref as any;
      }

      if (cancelled) return;
      const n = (data as unknown as StudyNote) || null;
      setNote(n);
      if (n) {
        // Redirect to canonical slug URL when the incoming path was a UUID
        // or a non-canonical/prefix match.
        const canonicalPath = n.slug ? `/study-notes/${n.slug}` : "";
        if (canonicalPath && (isUuid || key !== n.slug || location.pathname !== canonicalPath)) {
          navigate(canonicalPath, { replace: true });
        }
        // Load the full same-topic set (no arbitrary limit) so numbered
        // series can be ordered deterministically client-side.
        const { data: rel } = await supabase
          .from("message_study_notes" as any)
          .select("*")
          .eq("status", "published")
          .eq("topic", n.topic)
          .order("title", { ascending: true });
        if (!cancelled) setRelated(((rel as unknown as StudyNote[]) || []));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idOrSlug, location.pathname, navigate]);

  const scriptures = useMemo(
    () => (note ? extractScriptureRefs(note.body) : []),
    [note],
  );

  const seriesNav = useMemo(
    () => (note ? buildSeriesNavigation(note, related) : null),
    [note, related],
  );
  const topicRecs = useMemo(
    () => (note && !seriesNav ? buildTopicRecommendations(note, related, 4) : []),
    [note, related, seriesNav],
  );


  const shareUrl = useMemo(() => (note ? buildShareUrl(note.slug || note.id) : ""), [note]);
  const canonicalUrl = note ? `${APP_BASE_URL}/study-notes/${note.slug || note.id}` : "";
  const description = useMemo(() => {
    if (!note) return "";
    const base = (note.excerpt && note.excerpt.trim()) || buildExcerpt(note.body, 220);
    const verses = scriptures.length ? ` Scriptures: ${scriptures.slice(0, 5).join(", ")}.` : "";
    return `${base} Topic: ${note.topic}.${verses}`.slice(0, 300);
  }, [note, scriptures]);

  const shareImage = useMemo(() => {
    if (!note) return DEFAULT_SHARE_IMAGE;
    return normalizeImageUrl(extractFirstImageUrl(note.body));
  }, [note]);

  const onShare = async () => {
    if (!note) return;
    if (navigator.share) {
      const shareData: ShareData = {
        title: note.title,
        url: shareUrl,
      };

      try {
        const imageFile = await buildShareImageFile(shareImage, note.title);
        const richShareData: ShareData | null = imageFile
          ? { ...shareData, files: [imageFile] }
          : null;

        if (
          richShareData &&
          typeof navigator.canShare === "function" &&
          navigator.canShare(richShareData)
        ) {
          await navigator.share(richShareData);
          return;
        }

        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: shareUrl, variant: "destructive" });
    }
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
      <Helmet>
        <title>{`${note.title} — MessageGuide Study Notes`}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content={[note.topic, ...note.tags, ...scriptures].join(", ")}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="MessageGuide" />
        <meta property="og:title" content={note.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:alt" content={note.title} />
        <meta property="article:section" content={note.topic} />
        {note.tags.map((t) => (
          <meta key={`tag-${t}`} property="article:tag" content={t} />
        ))}
        {scriptures.map((s) => (
          <meta key={`scrip-${s}`} property="article:tag" content={s} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={note.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={shareImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: note.title,
            about: note.topic,
            keywords: [...note.tags, ...scriptures].join(", "),
            url: canonicalUrl,
            publisher: { "@type": "Organization", name: "MessageGuide" },
          })}
        </script>
      </Helmet>
      <Header showBackButton pageTitle={note.title} />
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

        {seriesNav && seriesNav.total > 1 && (
          <section
            className="mt-12 border-t pt-8 print:hidden"
            aria-label={`${seriesNav.seriesTitle} series navigation`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">Related study notes</h2>
              <span className="text-sm text-muted-foreground">
                Part {seriesNav.current} of {seriesNav.items[seriesNav.items.length - 1].part}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {seriesNav.previous ? (
                <Link
                  to={`/study-notes/${seriesNav.previous.slug || seriesNav.previous.id}`}
                  aria-label={`Previous part: ${seriesNav.previous.title}`}
                  title={seriesNav.previous.title}
                  className="flex items-start gap-3 rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition"
                >
                  <ChevronLeft className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                      Previous part
                    </span>
                    <span className="block font-medium text-foreground break-words">
                      Part {seriesNav.previous.part}
                    </span>
                    <span className="block text-xs text-muted-foreground break-words">
                      {seriesNav.previous.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="hidden sm:block" aria-hidden="true" />
              )}

              {seriesNav.next && (
                <Link
                  to={`/study-notes/${seriesNav.next.slug || seriesNav.next.id}`}
                  aria-label={`Next part: ${seriesNav.next.title}`}
                  title={seriesNav.next.title}
                  className="flex items-start gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4 hover:bg-primary/10 transition sm:text-right sm:flex-row-reverse"
                >
                  <ArrowRight className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wide text-primary font-semibold">
                      Next part
                    </span>
                    <span className="block font-medium text-foreground break-words">
                      Part {seriesNav.next.part}
                    </span>
                    <span className="block text-xs text-muted-foreground break-words">
                      {seriesNav.next.title}
                    </span>
                  </span>
                </Link>
              )}
            </div>

            <nav className="mt-4" aria-label="All parts in this series">
              <ul className="flex flex-wrap gap-2">
                {seriesNav.items.map((item) => (
                  <li key={item.id}>
                    {item.isCurrent ? (
                      <span
                        aria-current="page"
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
                      >
                        {item.part}
                      </span>
                    ) : (
                      <Link
                        to={`/study-notes/${item.slug || item.id}`}
                        aria-label={`Go to ${item.title}`}
                        title={item.title}
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm text-foreground hover:border-primary hover:bg-accent/40 transition"
                      >
                        {item.part}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        )}

        {!seriesNav && topicRecs.length > 0 && (
          <section className="mt-12 border-t pt-8 print:hidden">
            <h2 className="text-xl font-semibold mb-4">Related study notes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {topicRecs.map((r) => (
                <Link
                  key={r.id}
                  to={`/study-notes/${r.slug || r.id}`}
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
  const { id, "*": splat } = useParams<{ id?: string; "*"?: string }>();
  const location = useLocation();
  const detailPath = id ? [id, splat].filter(Boolean).join("/") : splat;
  if (detailPath) return <StudyNoteDetail idOrSlug={detailPath || location.pathname} />;
  return <StudyNotesList />;
}
