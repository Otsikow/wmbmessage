import { findMessageMatches, loadMessageBatch, type MessageMatch } from "./messageArchive";

self.onmessage = async ({ data }: MessageEvent<{ files: string[]; query: string }>) => {
  const { files, query } = data;
  const results: MessageMatch[][] = [];
  let completed = 0;
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(4, files.length) }, async () => {
      while (cursor < files.length) {
        const index = cursor++;
        const batch = await loadMessageBatch(files[index]);
        results[index] = findMessageMatches(batch, query);
        self.postMessage({ type: "progress", completed: ++completed });
      }
    }));
    self.postMessage({ type: "results", results: results.flat() });
  } catch {
    self.postMessage({ type: "error" });
  }
};
