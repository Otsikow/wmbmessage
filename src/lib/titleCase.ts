// Words that should stay lowercase in the middle of a title (English style guide).
const LOWERCASE_WORDS = new Set([
  "a","an","and","as","at","but","by","en","for","from","if","in","into","of",
  "on","or","nor","the","to","up","via","vs","yet","so",
]);

// Tokens that must always render as upper-case (acronyms, Roman numerals).
const ALWAYS_UPPER = new Set([
  "i","ii","iii","iv","v","vi","vii","viii","ix","x",
  "kjv","jr","sr","ok","usa","uk","wmb",
]);

/**
 * Convert a song / hymn title to clean Title Case.
 * - Leaves intentional uppercase acronyms alone.
 * - Lowercases short articles/prepositions in the middle.
 * - Always capitalises the first and last word.
 * - Preserves hyphenated words ("Blood-Washed").
 */
export function toTitleCase(input: string): string {
  if (!input) return input;

  const normalised = input.trim().replace(/\s+/g, " ");
  // Split on spaces but keep punctuation attached to words.
  const tokens = normalised.split(" ");
  const last = tokens.length - 1;

  return tokens
    .map((token, idx) => formatToken(token, idx === 0 || idx === last))
    .join(" ");
}

function formatToken(token: string, isEdge: boolean): string {
  if (!token) return token;

  // Handle hyphenated / slashed compounds piece-by-piece.
  if (/[-/]/.test(token)) {
    return token
      .split(/([-/])/)
      .map((part) => (part === "-" || part === "/" ? part : formatToken(part, true)))
      .join("");
  }

  // Pull off leading/trailing punctuation so we can title-case the core word.
  const leadingMatch = token.match(/^[^\p{L}\p{N}]+/u);
  const trailingMatch = token.match(/[^\p{L}\p{N}]+$/u);
  const leading = leadingMatch ? leadingMatch[0] : "";
  const trailing = trailingMatch ? trailingMatch[0] : "";
  const core = token.slice(leading.length, token.length - trailing.length);

  if (!core) return token;

  const lower = core.toLowerCase();

  if (ALWAYS_UPPER.has(lower)) {
    return leading + core.toUpperCase() + trailing;
  }

  if (!isEdge && LOWERCASE_WORDS.has(lower)) {
    return leading + lower + trailing;
  }

  // Default: capitalise first letter, lowercase the rest.
  const titled = lower.charAt(0).toUpperCase() + lower.slice(1);
  return leading + titled + trailing;
}
