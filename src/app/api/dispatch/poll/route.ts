import { NextRequest, NextResponse } from "next/server";
import { getPollResults, recordPollVote } from "@/db/actions/dispatch-actions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date param" }, { status: 400 });
  }
  const results = await getPollResults(date);
  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  let body: { date?: string; option?: string; fid?: string | number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const date = typeof body.date === "string" ? body.date : null;
  const option = typeof body.option === "string" ? body.option : null;
  const fid =
    body.fid === null || body.fid === undefined || body.fid === ""
      ? null
      : String(body.fid);

  if (!date || !option) {
    return NextResponse.json(
      { error: "Missing date or option" },
      { status: 400 },
    );
  }

  try {
    const result = await recordPollVote(date, option, fid);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.results);
  } catch (err) {
    console.error("[poll] recordPollVote threw:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Vote failed: ${message}` },
      { status: 500 },
    );
  }
}
