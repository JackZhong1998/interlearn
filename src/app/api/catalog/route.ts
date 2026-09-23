import { NextResponse } from "next/server";
import { loadCatalog } from "@/lib/catalog";
import { TEACHERS } from "@/data/teachers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ series: loadCatalog(), teachers: TEACHERS });
}
