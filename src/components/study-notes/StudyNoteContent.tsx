import { ReactNode, useMemo } from "react";
import { formatStudyNote, type StudyBlock } from "@/lib/studyNoteFormatter";
import { Quote, Sparkles, Heart, Lightbulb, BookMarked } from "lucide-react";
import { linkifyScriptures, ScriptureRefLink } from "@/lib/linkifyScripture";

function Rich({ text, query }: { text: string; query?: string }): ReactNode {
  return linkifyScriptures(text, query);
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
          <Rich text={block.text} query={query} />
        </Tag>
      );
    }
    case "scripture": {
      const hasBody = !!block.text && block.text.trim().length > 0;
      if (!hasBody) {
        return (
          <div
            key={idx}
            className="my-1.5 inline-flex items-center rounded-md border-l-2 border-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 mr-2 hover:bg-primary/10 transition-colors"
          >
            <ScriptureRefLink reference={block.reference} query={query} />
          </div>
        );
      }
      return (
        <div
          key={idx}
          className="my-2 rounded-md border-l-2 border-primary bg-primary/5 dark:bg-primary/10 px-3 py-2 hover:bg-primary/10 transition-colors"
        >
          <div className="mb-0.5">
            <ScriptureRefLink reference={block.reference} query={query} />
          </div>
          <p className="text-foreground/90 italic leading-snug text-sm md:text-base">
            <Rich text={block.text!} query={query} />
          </p>
        </div>
      );
    }
    case "quote":
      return (
        <figure
          key={idx}
          className="my-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-5 shadow-sm"
        >
          <Quote className="h-5 w-5 text-amber-700 dark:text-amber-400 mb-2" />
          <blockquote className="text-foreground/90 leading-relaxed italic">
            <Rich text={block.text} query={query} />
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-2 text-sm text-amber-800 dark:text-amber-300 font-medium">
              — {block.attribution}
            </figcaption>
          )}
        </figure>
      );
    case "message-ref":
      return (
        <div
          key={idx}
          className="my-3 inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <BookMarked className="h-4 w-4" />
          <Rich text={block.text} query={query} />
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
            <Rich text={block.text} query={query} />
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
            <Rich text={block.text} query={query} />
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
            <Rich text={block.text} query={query} />
          </p>
        </div>
      );
    case "image": {
      const alignClass =
        block.align === "left"
          ? "float-none md:float-left md:mr-6 md:mb-3 md:max-w-[45%]"
          : block.align === "right"
          ? "float-none md:float-right md:ml-6 md:mb-3 md:max-w-[45%]"
          : "mx-auto";
      return (
        <figure key={idx} className={`my-6 ${alignClass}`}>
          <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-md">
            <img
              src={block.src}
              alt={block.alt}
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          </div>
          {(block.caption || block.alt) && (
            <figcaption className="mt-2 text-center text-sm italic text-muted-foreground">
              {block.caption || block.alt}
            </figcaption>
          )}
        </figure>
      );
    }
    case "list":
      return block.ordered ? (
        <ol key={idx} className="my-3 ml-6 list-decimal space-y-1.5 text-foreground/90">
          {block.items.map((it, i) => (
            <li key={i}><Rich text={it} query={query} /></li>
          ))}
        </ol>
      ) : (
        <ul key={idx} className="my-3 ml-6 list-disc space-y-1.5 text-foreground/90">
          {block.items.map((it, i) => (
            <li key={i}><Rich text={it} query={query} /></li>
          ))}
        </ul>
      );
    case "paragraph":
    default:
      return (
        <p key={idx} className="my-3 leading-relaxed text-foreground/90">
          <Rich text={block.text} query={query} />
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
