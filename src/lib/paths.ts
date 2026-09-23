import fs from "fs";
import path from "path";

export const PROJECT_STORE =
  "/cursor/stores/bc-01a0c9f7-1b4c-7341-886f-a0ee86592e93";
export const SELF_STORE = "/cursor/stores/self";

export const SERIES_DIRS = [
  path.join(PROJECT_STORE, "media/interlearn/series"),
  path.join(process.cwd(), "public/media/series"),
];

export const TEACHER_DIRS = [
  path.join(PROJECT_STORE, "media/interlearn/teachers"),
  path.join(process.cwd(), "public/media/teachers"),
];

export const CATALOG_MD = path.join(PROJECT_STORE, "docs/content-series.md");

export function firstExisting(...candidates: string[]): string | undefined {
  return candidates.find((p) => {
    try {
      return fs.existsSync(p) && fs.statSync(p).size > 0;
    } catch {
      return false;
    }
  });
}

export function safeJoin(root: string, rel: string): string | null {
  const resolved = path.resolve(root, rel);
  if (!resolved.startsWith(path.resolve(root))) return null;
  return resolved;
}
