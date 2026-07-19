import { ReactNode, useMemo } from "react";
import { Link } from "react-router-dom";
import { formatStudyNote, type StudyBlock } from "@/lib/studyNoteFormatter";
import { Quote, Sparkles, Heart, Lightbulb, BookMarked } from "lucide-react";
import { linkifyScriptures } from "@/lib/linkifyScripture";
import { ScriptureRefLink } from "@/lib/linkifyScripture";

// Matches markdown links [label](url) and bare http(s) URLs
const MD_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;

function renderLink(href: string, label: string, key: string): ReactNode {
  try {
    const url = new URL(href);
    const isInternal =
      url.hostname === "messageguide.org" ||
      url.hostname === "www.messageguide.org" ||
      url.hostname.endsWith(".lovable.app");
    if (isInternal) {
      const to = url.pathname + url.search + url.hash;
      return (
        <Link
          key={key}
          to={to}
          className="text-primary font-medium underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
        >
          {label}
        </Link>
      );
    }
  } catch {
    /* fall through to external */
  }
  return (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-medium underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
    >
      {label}
    </a>
  );
}

function Rich({ text, query }: { text: string; query?: string }): ReactNode {
  if (!text) return text;
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const re = new RegExp(MD_LINK_RE.source, MD_LINK_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push(
        <span key={`t-${key++}`}>
          {linkifyScriptures(text.slice(lastIndex, m.index), query)}
        </span>,
      );
    }
    const label = m[1] ?? m[3] ?? m[0];
    const href = m[2] ?? m[3] ?? "";
    out.push(renderLink(href, label, `l-${key++}`));
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    out.push(
      <span key={`t-${key++}`}>
        {linkifyScriptures(text.slice(lastIndex), query)}
      </span>,
    );
  }
  return <>{out}</>;
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
