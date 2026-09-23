import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/llm";
import { findSeries } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { seriesId, clipId, teacherId } = (await req.json()) as {
    seriesId: string;
    clipId: string;
    teacherId?: string;
  };
  const series = findSeries(seriesId);
  if (!series) return NextResponse.json({ error: "no series" }, { status: 404 });
  const clip = series.clips[clipId];
  if (!clip) return NextResponse.json({ error: "no clip" }, { status: 404 });

  if (clip.choices?.length === 3 && clip.choices.every((c) => series.clips[c.nextClipId]?.prefab)) {
    return NextResponse.json({
      clipId,
      choices: clip.choices,
      source: "prefab",
      teacherId,
    });
  }

  const generated = await generateLater(series.title, clip.title, clip.script);
  return NextResponse.json({
    clipId,
    choices: generated,
    source: generated[0]?.id.startsWith("gen-") ? "llm-or-local" : "llm-or-local",
    teacherId,
  });
}

async function generateLater(seriesTitle: string, clipTitle: string, script: string) {
  const fallback = [
    {
      id: "later-a",
      label: "把刚才那步再拆开",
      hint: "更细的一步",
      nextClipId: `gen-${clipTitle}-a`,
      script: `接着 ${clipTitle}：只做更小的下一步，做完再停。`,
    },
    {
      id: "later-b",
      label: "换一种人格重来",
      hint: "同一局面",
      nextClipId: `gen-${clipTitle}-b`,
      script: `还是这个局面，但换一种人来走。你会看见代价不同。`,
    },
    {
      id: "later-c",
      label: "承认翻车，改名继续",
      hint: "留出口",
      nextClipId: `gen-${clipTitle}-c`,
      script: `刚才那步废了也没关系。改一个名字，继续往下。`,
    },
  ];

  const text = await chatComplete(
    [
      {
        role: "system",
        content:
          "你为互动视频生成第二层三个选项。返回 JSON：{choices:[{id,label,hint,script,nextClipId}]}。label≤14字，口播8-12秒。中文。",
      },
      {
        role: "user",
        content: `系列《${seriesTitle}》刚播完「${clipTitle}」。口播：${script}。请推荐 3 个后续分支。`,
      },
    ],
    { json: true, temperature: 0.6 },
  );

  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text) as { choices?: typeof fallback };
    if (parsed.choices?.length === 3) return parsed.choices;
  } catch {
    /* fall through */
  }
  return fallback;
}
