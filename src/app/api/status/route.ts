import { NextResponse } from "next/server";
import { falConfig, llmConfig } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  const llm = llmConfig();
  const fal = falConfig();
  return NextResponse.json({
    llm: { ready: llm.ready, model: llm.model, provider: llm.provider },
    fal: { ready: fal.ready, image: fal.image, i2v: fal.i2v, t2v: fal.t2v },
  });
}
