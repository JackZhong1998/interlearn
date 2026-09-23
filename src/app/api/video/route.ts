import { NextResponse } from "next/server";
import { falConfig } from "@/lib/models";
import { generateVideoFromTeacher, generateVideoFromText, videoUrlFromFal } from "@/lib/fal";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { prompt, teacherImageUrl, script } = (await req.json()) as {
    prompt?: string;
    teacherImageUrl?: string;
    script?: string;
  };
  const cfg = falConfig();
  if (!cfg.ready) {
    return NextResponse.json({
      ok: false,
      fallback: "personalized",
      reason: "FAL_KEY 未配置，后续镜头用老师参考图本地播放",
    });
  }

  const action =
    prompt ||
    `A teacher speaking to camera in a vertical 9:16 cinematic shot, subtle motion, ${script || "explaining clearly"}.`;

  try {
    const data = teacherImageUrl
      ? await generateVideoFromTeacher(teacherImageUrl, action)
      : await generateVideoFromText(action);
    const url = videoUrlFromFal(data);
    return NextResponse.json({ ok: Boolean(url), url, model: teacherImageUrl ? cfg.i2v : cfg.t2v });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      fallback: "personalized",
      error: String(err),
    });
  }
}
