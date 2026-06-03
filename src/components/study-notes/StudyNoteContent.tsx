import { useMemo } from "react";
import { formatStudyNote, type StudyBlock } from "@/lib/studyNoteFormatter";
import { BookOpen, Quote, Sparkles, Heart, Lightbulb, BookMarked } from "lucide-react";

function Highlighted({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function renderBlock(block: StudyBlock, idx: number, query?: string) {
  switch (block.type) {
    case "heading": {
      const sizes = {
        1: "text-2xl md:text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2",
        2: "text-xl md:text-2xl font-semibold mt-6 mb-3 text-foreground",
        3: "text-lg md:text-xl font-semibold mt-4 mb-2 text-foreground",
      } as const;
      const Tag = (`h${block.level + 1}` as "h2" | "h3" | "h4");
      return (
        <Tag key={idx} className={sizes[block.level]}>
          <Highlighted text={block.text} query={query} />
        </Tag>
      );
    }
    case "scripture":
      return (
        <div
          key={idx}
          className="my-4 rounded-lg border-l-4 border-primary bg-primary/5 dark:bg-primary/10 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <BookOpen className="h-4 w-4" />
            <span><Highlighted text={block.reference} query={query} /></span>
          </div>
          {block.text && (
            <p className="text-foreground/90 italic leading-relaxed">
              <Highlighted text={block.text} query={query} />
            </p>
          )}
        </div>
      );
    case "quote":
      return (
        <figure
          key={idx}
          className="my-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-5 shadow-sm"
        >
          <Quote className="h-5 w-5 text-amber-700 dark:text-amber-400 mb-2" />
          <blockquote className="text-foreground/90 leading-relaxed italic">
            <Highlighted text={block.text} query={query} />
          </blockquote>
          <figcaption className="mt-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
            — {block.attribution || "Brother Branham"}
          </figcaption>
        </figure>
      );
    case "message-ref":
      return (
        <div
          key={idx}
          className="my-3 inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <BookMarked className="h-4 w-4" />
          <Highlighted text={block.text} query={query} />
        </div>
      );
    case "key-point":
      return (
        <div
          key={idx}
          className="my-4 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4"
        >
          <Lightbulb className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <p className="text-foreground font-medium leading-relaxed">
            <Highlighted text={block.text} query={query} />
          </p>
        </div>
      );
    case "prayer":
      return (
        <div
          key={idx}
          className="my-5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4"
        >
          <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300 mb-2">
            <Heart className="h-4 w-4" /> Prayer
          </div>
          <p className="text-foreground/90 leading-relaxed">
            <Highlighted text={block.text} query={query} />
          </p>
        </div>
      );
    case "reflection":
      return (
        <div
          key={idx}
          className="my-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4"
        >
          <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
            <Sparkles className="h-4 w-4" /> Reflection
          </div>
          <p className="text-foreground/90 leading-relaxed">
            <Highlighted text={block.text} query={query} />
          </p>
        </div>
      );
    case "list":
      return block.ordered ? (
        <ol key={idx} className="my-3 ml-6 list-decimal space-y-1.5 text-foreground/90">
          {block.items.map((it, i) => (
            <li key={i}><Highlighted text={it} query={query} /></li>
          ))}
        </ol>
      ) : (
        <ul key={idx} className="my-3 ml-6 list-disc space-y-1.5 text-foreground/90">
          {block.items.map((it, i) => (
            <li key={i}><Highlighted text={it} query={query} /></li>
          ))}
        </ul>
      );
    case "paragraph":
    default:
      return (
        <p key={idx} className="my-3 leading-relaxed text-foreground/90">
          <Highlighted text={block.text} query={query} />
        </p>
      );
  }
}

export function StudyNoteContent({ body, query }: { body: string; query?: string }) {
  const blocks = useMemo(() => formatStudyNote(body), [body]);
  return (
    <article className="prose-none max-w-none text-base md:text-lg">
      {blocks.map((b, i) => renderBlock(b, i, query))}
    </article>
  );
}
