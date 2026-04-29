import { NextResponse } from "next/server";
import { getRomeDispatchPoll, recordRomeDispatchVote } from "@/lib/rome-dispatch-generator";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  if (!date) return NextResponse.json({ results: {} });
  const results = await getRomeDispatchPoll(date);
  return NextResponse.json({ results });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { date?: string; option?: string };
  if (!body.date || !body.option) {
    return NextResponse.json({ error: "date and option are required" }, { status: 400 });
  }

  const results = await recordRomeDispatchVote(body.date, body.option);
  return NextResponse.json({ results });
}
