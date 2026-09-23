import { NextResponse } from "next/server";
import { falConfig } from "@/lib/models";
import { generateTeacherPortraits } from "@/lib/fal";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt?: string };
  const cfg = falConfig();
  if (!cfg.ready) {
    return NextResponse.json({
      ok: false,
      reason: "FAL_KEY 未配置，请使用已预制的男女老师肖像",
      model: cfg.image,
    });
  }
  try {
    const data = await generateTeacherPortraits(
      prompt ||
        "Photorealistic portrait of a distinctive adult teacher looking at camera, fashion photography, tasteful, portrait_4_3",
    );
    return NextResponse.json({
      ok: true,
      model: cfg.image,
      images: (data.images || []).map((img, i) => ({
        id: `gen-${Date.now()}-${i}`,
        url: img.url,
      })),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), model: cfg.image }, { status: 502 });
  }
}
