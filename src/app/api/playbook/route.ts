import { NextResponse } from "next/server";
import { getPlaybook } from "@/lib/playbook";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ playbook: getPlaybook() });
}
