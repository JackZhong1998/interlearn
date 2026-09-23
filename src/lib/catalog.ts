import fs from "fs";
import path from "path";
import { BUNDLED_SERIES, LEARNING_SLUGS } from "@/data/bundled-series";
import type { Series } from "@/lib/types";
import { CATALOG_MD, SERIES_DIRS, firstExisting } from "@/lib/paths";
import { withBase } from "@/lib/base-path";

const LEARNING = new Set<string>(LEARNING_SLUGS);
const BLOCKED = new Set([
  "kitchen-crash",
  "interview-trap",
  "payday-night",
  "party-icebreak",
  "elevator-night",
  "llm-basics",
  "proof-gap",
  "sentence-cut",
  "energy-ledger",
  "source-fight",
  "bug-first",
]);

function mediaUrl(seriesId: string, file: string) {
  const store = firstExisting(
    path.join(SERIES_DIRS[0], seriesId, file),
    path.join(SERIES_DIRS[1], seriesId, file),
  );
  if (store) return withBase(`/media/series/${seriesId}/${file}`);
  return undefined;
}

function readScript(seriesId: string, clipId: string, fallback: string) {
  for (const root of SERIES_DIRS) {
    const file = path.join(root, seriesId, `${clipId}.txt`);
    if (!fs.existsSync(file)) continue;
    const lines = fs.readFileSync(file, "utf8").trim().split(/\n/);
    const body = lines
      .slice(1)
      .filter((line) => line.trim() && !/^(License|Source):/i.test(line.trim()));
    return body.join("") || fallback;
  }
  return fallback;
}

function overlayFilesystem(series: Series): Series {
  const next = { ...series, clips: { ...series.clips } };
  next.cover =
    mediaUrl(series.id, "poster.jpg") ||
    mediaUrl(series.id, "start.jpg") ||
    series.cover;
  for (const [id, clip] of Object.entries(series.clips)) {
    const video = mediaUrl(series.id, `${id}.mp4`);
    const poster =
      mediaUrl(series.id, `${id}.jpg`) ||
      mediaUrl(series.id, "poster.jpg") ||
      clip.poster;
    next.clips[id] = {
      ...clip,
      script: readScript(series.id, id, clip.script),
      video: video || clip.video,
      poster,
      prefab: clip.depth <= 1 && Boolean(video || clip.video),
    };
  }
  return next;
}

function scanExtraSeries(known: Set<string>): Series[] {
  const extras: Series[] = [];
  const root = SERIES_DIRS.find((d) => fs.existsSync(d));
  if (!root) return extras;
  for (const name of fs.readdirSync(root)) {
    if (known.has(name) || BLOCKED.has(name) || !LEARNING.has(name)) continue;
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    if (!firstExisting(path.join(dir, "start.mp4"))) continue;
    extras.push({
      id: name,
      title: name,
      subtitle: "新增学习系列",
      tag: "学习",
      author: "现场老师",
      cover: withBase(`/media/series/${name}/poster.jpg`),
      startClipId: "start",
      source: "store",
      clips: {
        start: {
          id: "start",
          title: name,
          script: "",
          video: withBase(`/media/series/${name}/start.mp4`),
          poster: withBase(`/media/series/${name}/start.jpg`),
          prefab: true,
          depth: 0,
          choices: ["a", "b", "c"].map((k) => ({
            id: k,
            label: `选项 ${k.toUpperCase()}`,
            hint: "继续拆",
            nextClipId: `branch-${k}`,
          })),
        },
        ...Object.fromEntries(
          ["a", "b", "c"].map((k) => [
            `branch-${k}`,
            {
              id: `branch-${k}`,
              title: `分支 ${k.toUpperCase()}`,
              script: "",
              video: withBase(`/media/series/${name}/branch-${k}.mp4`),
              poster: withBase(`/media/series/${name}/branch-${k}.jpg`),
              prefab: true,
              depth: 1,
              choices: [],
            },
          ]),
        ),
      },
    });
  }
  void CATALOG_MD;
  return extras;
}

function seriesReady(id: string) {
  return Boolean(
    firstExisting(
      path.join(SERIES_DIRS[0], id, "start.mp4"),
      path.join(SERIES_DIRS[1], id, "start.mp4"),
    ),
  );
}

export function loadCatalog(): Series[] {
  const bundled = BUNDLED_SERIES.filter((s) => LEARNING.has(s.id) && seriesReady(s.id)).map(
    overlayFilesystem,
  );
  const known = new Set(bundled.map((s) => s.id));
  return [...bundled, ...scanExtraSeries(known).map(overlayFilesystem)];
}

export function findSeries(id: string): Series | undefined {
  return loadCatalog().find((s) => s.id === id);
}
