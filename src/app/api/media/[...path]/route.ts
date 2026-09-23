import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PROJECT_STORE, SELF_STORE, safeJoin } from "@/lib/paths";

export const dynamic = "force-dynamic";

const ROOTS = [
  path.join(process.cwd(), "public/media"),
  path.join(PROJECT_STORE, "media/interlearn"),
  path.join(SELF_STORE, "media/interlearn"),
];

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await ctx.params;
  const rel = parts.join("/");
  if (rel.includes("..")) return new NextResponse("bad path", { status: 400 });

  for (const root of ROOTS) {
    const full = safeJoin(root, rel);
    if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) continue;
    const buf = fs.readFileSync(full);
    const ext = path.extname(full).toLowerCase();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  return new NextResponse("not found", { status: 404 });
}
