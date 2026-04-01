import { NextRequest, NextResponse } from "next/server";
import { generateDispatchContent } from "@/lib/dispatch-generator";

export const maxDuration = 60;

// ─── Route Handler ───────────────────────────────────────────────────────────

// Vercel cron jobs invoke GET requests
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateDispatchContent();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ message: result.message, date: result.date });
}

// Admin panel uses POST (always requires auth)
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateDispatchContent();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ message: result.message, date: result.date });
}
