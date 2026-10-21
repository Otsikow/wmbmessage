/**
 * Pure helpers for the Study Library topic filter.
 *
 * The filter is derived exclusively from topics that contain at least one
 * published note. Predefined but empty categories stay hidden and reappear
 * automatically once a note in that topic is published (and disappear again
 * when the last published note is unpublished).
 */

/**
 * Extract the sorted, deduplicated list of topics that actually have at
 * least one published note. Draft-only topics are excluded.
 */
export function extractPublishedTopics(
  rows: { topic: string | null; status?: string | null }[],
): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.status && row.status !== "published") continue;
    if (row.topic) set.add(row.topic);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Topic filter options: "All" plus every non-empty published topic. */
export function deriveTopicOptions(publishedTopics: string[]): string[] {
  return ["All", ...publishedTopics];
}

/**
 * Decide whether a topic from the URL is stale (has no published notes) and
 * must reset to "All". Never resets while the topic list is still loading or
 * after the topic query failed — only on a successfully loaded list.
 */
export function shouldResetTopic(args: {
  topic: string;
  publishedTopics: string[];
  topicsLoaded: boolean;
  topicsError: string | null;
}): boolean {
  const { topic, publishedTopics, topicsLoaded, topicsError } = args;
  if (!topicsLoaded || topicsError) return false;
  if (topic === "All") return false;
  return !publishedTopics.includes(topic);
}
