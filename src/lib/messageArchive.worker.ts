import { compareMessageMatches, findMessageMatches, loadMessageBatch, type MessageMatch } from "./messageArchive";

const RESULT_LIMIT = 1000;

self.onmessage = async ({ data }: MessageEvent<{ files: string[]; query: string }>) => {
  const { files, query } = data;
  const results: MessageMatch[][] = [];
  let completed = 0;
  let total = 0;
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(4, files.length) }, async () => {
      while (cursor < files.length) {
        const index = cursor++;
        const batch = await loadMessageBatch(files[index]);
        const matches = findMessageMatches(batch, query);
        total += matches.length;
        results[index] = matches.slice(0, RESULT_LIMIT);
        self.postMessage({ type: "progress", completed: ++completed });
      }
    }));
    self.postMessage({ type: "results", total, results: results.flat().sort(compareMessageMatches).slice(0, RESULT_LIMIT) });
  } catch {
    self.postMessage({ type: "error" });
  }
};
