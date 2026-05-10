import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter() {
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "javascript",
      "typescript",
      "vue",
      "css",
      "html",
      "bash",
      "json",
      "sql",
    ],
  });

  return highlighterPromise;
}
