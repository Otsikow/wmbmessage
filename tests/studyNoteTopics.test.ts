import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  deriveTopicOptions,
  extractPublishedTopics,
  shouldResetTopic,
} from "@/hooks/useStudyNoteSearch";

describe("extractPublishedTopics", () => {
  test("empty predefined topics never appear (only published rows count)", () => {
    // "The Mark of the Beast" is a predefined category with no posts.
    const topics = extractPublishedTopics([
      { topic: "Faith", status: "published" },
    ]);
    assert.deepEqual(topics, ["Faith"]);
    assert.ok(!topics.includes("The Mark of the Beast"));
  });

  test("published topics are deduplicated and sorted alphabetically", () => {
    const topics = extractPublishedTopics([
      { topic: "Healing", status: "published" },
      { topic: "Faith", status: "published" },
      { topic: "Healing", status: "published" },
      { topic: null, status: "published" },
    ]);
    assert.deepEqual(topics, ["Faith", "Healing"]);
  });

  test("draft-only topics are excluded until a note is published", () => {
    const draftOnly = extractPublishedTopics([
      { topic: "Faith", status: "published" },
      { topic: "The Rapture", status: "draft" },
    ]);
    assert.deepEqual(draftOnly, ["Faith"]);

    const nowPublished = extractPublishedTopics([
      { topic: "Faith", status: "published" },
      { topic: "The Rapture", status: "draft" },
      { topic: "The Rapture", status: "published" },
    ]);
    assert.deepEqual(nowPublished, ["Faith", "The Rapture"]);
  });
});

describe("deriveTopicOptions", () => {
  test("always starts with All Topics even when the library is empty", () => {
    assert.deepEqual(deriveTopicOptions([]), ["All"]);
  });

  test("keeps every populated topic independent of any search query", () => {
    // The list is derived from ALL published notes, so a zero-match search
    // must not shrink the available categories.
    const options = deriveTopicOptions(["Faith", "Healing"]);
    assert.deepEqual(options, ["All", "Faith", "Healing"]);
  });
});

describe("shouldResetTopic", () => {
  const published = ["Faith", "Healing"];

  test("stale topic in the URL resets after the list loads", () => {
    assert.equal(
      shouldResetTopic({
        topic: "The Mark of the Beast",
        publishedTopics: published,
        topicsLoaded: true,
        topicsError: null,
      }),
      true,
    );
  });

  test("does not reset while the topic list is still loading", () => {
    assert.equal(
      shouldResetTopic({
        topic: "The Mark of the Beast",
        publishedTopics: [],
        topicsLoaded: false,
        topicsError: null,
      }),
      false,
    );
  });

  test("does not reset when the topic query failed", () => {
    assert.equal(
      shouldResetTopic({
        topic: "The Mark of the Beast",
        publishedTopics: [],
        topicsLoaded: true,
        topicsError: "network error",
      }),
      false,
    );
  });

  test("keeps a valid topic and All Topics untouched", () => {
    assert.equal(
      shouldResetTopic({ topic: "Faith", publishedTopics: published, topicsLoaded: true, topicsError: null }),
      false,
    );
    assert.equal(
      shouldResetTopic({ topic: "All", publishedTopics: published, topicsLoaded: true, topicsError: null }),
      false,
    );
  });
});
