import { describe, expect, it } from "vitest";
import {
  buildSeriesNavigation,
  buildTopicRecommendations,
  parseSeriesTitle,
} from "../src/lib/studyNoteSeries";

const mk = (part: number) => ({
  id: `id-${part}`,
  title: `THE SEVEN CHURCH AGES - PART ${part}`,
  slug: `the-seven-church-ages-part-${part}`,
  topic: "Seven Church Ages",
});

describe("parseSeriesTitle", () => {
  it("parses hyphen, en dash and lowercase variants", () => {
    expect(parseSeriesTitle("THE SEVEN CHURCH AGES - PART 5")).toMatchObject({ part: 5 });
    expect(parseSeriesTitle("The Seven Church Ages – Part 6")).toMatchObject({ part: 6 });
    expect(parseSeriesTitle("the seven church ages part 10")).toMatchObject({ part: 10 });
    expect(parseSeriesTitle("The Seven Church Ages: Part 2")).toMatchObject({ part: 2 });
  });

  it("groups variants under the same series key", () => {
    const a = parseSeriesTitle("THE SEVEN CHURCH AGES - PART 5")!;
    const b = parseSeriesTitle("The Seven Church Ages – Part 6")!;
    expect(a.seriesKey).toBe(b.seriesKey);
  });

  it("returns null for non-series titles", () => {
    expect(parseSeriesTitle("A Paradox")).toBeNull();
    expect(parseSeriesTitle("Part of the Body")).toBeNull();
  });
});

describe("buildSeriesNavigation", () => {
  const all = [mk(10), mk(2), mk(1), mk(6), mk(5), mk(4), mk(3)];

  it("orders numerically (Part 2 before Part 10) and excludes duplicates", () => {
    const nav = buildSeriesNavigation(mk(5), all)!;
    expect(nav.items.map((i) => i.part)).toEqual([1, 2, 3, 4, 5, 6, 10]);
    expect(nav.items.filter((i) => i.id === "id-5")).toHaveLength(1);
  });

  it("gives Part 6 as next on Part 5", () => {
    const nav = buildSeriesNavigation(mk(5), all)!;
    expect(nav.next?.slug).toBe("the-seven-church-ages-part-6");
    expect(nav.previous?.slug).toBe("the-seven-church-ages-part-4");
    expect(nav.current).toBe(5);
    expect(nav.total).toBe(7);
  });

  it("handles boundaries", () => {
    expect(buildSeriesNavigation(mk(1), all)!.previous).toBeNull();
    expect(buildSeriesNavigation(mk(10), all)!.next).toBeNull();
  });

  it("returns null for non-series notes", () => {
    expect(buildSeriesNavigation({ id: "x", title: "A Paradox" }, all)).toBeNull();
  });
});

describe("buildTopicRecommendations", () => {
  it("excludes the current note and orders deterministically", () => {
    const recs = buildTopicRecommendations(mk(5), [mk(5), mk(2), mk(1)], 4);
    expect(recs.map((r) => r.id)).toEqual(["id-1", "id-2"]);
  });
});
