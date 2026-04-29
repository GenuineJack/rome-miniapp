/* eslint-disable @neynar/no-process-env */

import { NextResponse } from "next/server";
import { generateRomeDispatch } from "@/lib/rome-dispatch-generator";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
    const dispatch = await generateRomeDispatch(date);
    return NextResponse.json({ status: "ok", date, dispatch });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate Rome dispatch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
