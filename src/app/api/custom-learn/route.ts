import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/llm";
import { falConfig, llmConfig } from "@/lib/models";
import { generateVideoFromText, videoUrlFromFal } from "@/lib/fal";
import { customLearnSystemPrompt, localCustomLearn, type CustomLearnPlan, type StoryboardShot } from "@/lib/custom-learn";

export const dynamic = "force-dynamic";

type Body = {
  goal?: string;
  method?: string;
  teacher?: { id: string; name: string; tag: string; image: string };
};

function parseStoryboard(raw: string): { explanation: string; storyboard: StoryboardShot[] } | null {
  const block = raw.match(/```json\s*([\s\S]*?)```/)?.[1] || raw;
  const start = block.indexOf("{");
  const end = block.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(block.slice(start, end + 1)) as {
      explanation?: string;
      storyboard?: StoryboardShot[];
    };
    if (!data.explanation || !Array.isArray(data.storyboard) || data.storyboard.length < 3) return null;
    return { explanation: data.explanation, storyboard: data.storyboard };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const goal = (body.goal || "").trim();
  const method = (body.method || "").trim();
  const teacher = body.teacher;
  if (!goal || !method || !teacher?.id) {
    return NextResponse.json({ error: "需要先锁定目标、方式和老师" }, { status: 400 });
  }

  const fallback = localCustomLearn({ goal, method, teacher });
  const llm = llmConfig();
  const fal = falConfig();
  let plan: CustomLearnPlan = fallback;

  if (llm.ready) {
    const content = await chatComplete(
      [
        { role: "system", content: customLearnSystemPrompt() },
        {
          role: "user",
          content: `目标：${goal}\n方式：${method}\n老师：${teacher.name}（${teacher.tag}）`,
        },
      ],
      { json: true, temperature: 0.6 },
    );
    const parsed = content ? parseStoryboard(content) : null;
    if (parsed) {
      plan = {
        ...fallback,
        explanation: parsed.explanation,
        storyboard: parsed.storyboard,
        provider: llm.provider,
        model: llm.model,
      };
    } else {
      plan.provider = llm.provider;
      plan.model = `${llm.model}（解析失败，用本地分镜）`;
    }
  }

  if (fal.ready) {
    try {
      const shot = plan.storyboard[0];
      const data = await generateVideoFromText(
        `${shot?.visual || ""} ${teacher.name} teaching, vertical 9:16, ${shot?.script || goal}`,
        5,
      );
      const url = videoUrlFromFal(data);
      if (url && plan.storyboard[0]) plan.storyboard[0] = { ...plan.storyboard[0], video: url };
      plan.videoModel = fal.t2v;
      plan.videoReason = url ? "已用 MiniMax H3 Max Turbo 出片头" : "视频模型未返回地址";
    } catch (err) {
      plan.videoModel = fal.t2v;
      plan.videoReason = `视频生成失败：${String(err).slice(0, 180)}。讲解和分镜仍可用。`;
    }
  } else {
    plan.videoReason = "FAL_KEY 未配置，已完成对话并给出讲解/分镜，未出片。";
  }

  return NextResponse.json({
    plan,
    llm: { ready: llm.ready, provider: llm.provider, model: llm.model },
    fal: { ready: fal.ready, t2v: fal.t2v, image: fal.image },
  });
}
