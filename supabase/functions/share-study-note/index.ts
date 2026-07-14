// Public edge function that returns crawler-friendly HTML for a study note
// with Open Graph / Twitter meta tags, and redirects human browsers to the app.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const APP_URL = "https://messageguide.org";
const DEFAULT_SHARE_IMAGE = `${APP_URL}/logo-512.png`;

const IMAGE_RE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)(?:\s*\{(left|right|center)\})?\s*$/m;

function extractFirstImage(body: string): string | null {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  for (const raw of lines) {
    const m = raw.trim().match(IMAGE_RE);
    if (m) return m[2];
  }
  return null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalm","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah",
  "Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation","Revelations",
];
const SCRIPTURE_RE = new RegExp(
  `\\b(?:${BIBLE_BOOKS.join("|")})\\s+\\d+(?::\\d+(?:-\\d+)?)?\\b`,
  "gi",
);

function extractScriptures(text: string): string[] {
  const matches = text.match(SCRIPTURE_RE) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const k = m.trim();
    if (!seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      out.push(k);
    }
  }
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildDescription(note: {
  excerpt: string | null;
  body: string;
  topic: string;
}, scriptures: string[]): string {
  const base =
    (note.excerpt && note.excerpt.trim()) ||
    note.body.replace(/\s+/g, " ").trim().slice(0, 220);
  const verses = scriptures.length
    ? ` Scriptures: ${scriptures.slice(0, 5).join(", ")}.`
    : "";
  const topic = ` Topic: ${note.topic}.`;
  return (base + topic + verses).slice(0, 300);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.redirect(`${APP_URL}/study-notes`, 302);
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const query = supabase
    .from("message_study_notes")
    .select("id,slug,title,topic,body,excerpt,tags,status")
    .eq("status", "published");
  const { data, error } = isUuid
    ? await query.eq("id", id).maybeSingle()
    : await query.eq("slug", id).maybeSingle();

  const appPath = data?.slug
    ? `${APP_URL}/study-notes/${data.slug}`
    : `${APP_URL}/study-notes/${id}`;

  if (error || !data) {
    return Response.redirect(`${APP_URL}/study-notes`, 302);
  }

  const scriptures = extractScriptures(data.body);
  const title = `${data.title} — MessageGuide Study Notes`;
  const description = buildDescription(data, scriptures);
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const shareImage = extractFirstImage(data.body) || DEFAULT_SHARE_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    about: data.topic,
    image: shareImage,
    keywords: [...tags, ...scriptures].join(", "),
    url: appPath,
    publisher: { "@type": "Organization", name: "MessageGuide" },
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta name="keywords" content="${escapeHtml([data.topic, ...tags, ...scriptures].join(", "))}" />
<link rel="canonical" href="${appPath}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="MessageGuide" />
<meta property="og:title" content="${escapeHtml(data.title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${appPath}" />
<meta property="og:image" content="${escapeHtml(shareImage)}" />
<meta property="og:image:alt" content="${escapeHtml(data.title)}" />
<meta property="article:section" content="${escapeHtml(data.topic)}" />
${tags.map((t: string) => `<meta property="article:tag" content="${escapeHtml(t)}" />`).join("\n")}
${scriptures.map((s) => `<meta property="article:tag" content="${escapeHtml(s)}" />`).join("\n")}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(data.title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(shareImage)}" />

<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

<meta http-equiv="refresh" content="0; url=${appPath}" />
<script>window.location.replace(${JSON.stringify(appPath)});</script>
</head>
<body>
<h1>${escapeHtml(data.title)}</h1>
<p><strong>Topic:</strong> ${escapeHtml(data.topic)}</p>
${scriptures.length ? `<p><strong>Scripture references:</strong> ${escapeHtml(scriptures.join(", "))}</p>` : ""}
<p>${escapeHtml(description)}</p>
<p><a href="${appPath}">Read this study note on MessageGuide →</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
});
