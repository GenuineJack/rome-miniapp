import { NextResponse } from "next/server";
import {
  getCachedRomeDispatch,
  generateRomeDispatch,
  getRomeDispatchPoll,
} from "@/lib/rome-dispatch-generator";

function getRomeDate(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
}

function getRomeHour(now = new Date()) {
  return Number(
    now.toLocaleTimeString("en-GB", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
    }).split(":")[0],
  );
}

export async function GET() {
  try {
    const date = getRomeDate();
    const cached = await getCachedRomeDispatch(date);

    if (cached) {
      const pollResults = await getRomeDispatchPoll(date);
      return NextResponse.json({ dispatch: cached, pollResults, date });
    }

    if (getRomeHour() < 7) {
      // Before 7am Rome time, today's dispatch hasn't been generated yet.
      // Fall back to yesterday's cached edition so the tab isn't empty.
      const yesterday = getRomeDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
      const previous = await getCachedRomeDispatch(yesterday);
      if (previous) {
        const pollResults = await getRomeDispatchPoll(yesterday);
        return NextResponse.json({ dispatch: previous, pollResults, date: yesterday, isPreviousEdition: true });
      }
      return NextResponse.json({ dispatch: null, pollResults: {}, date });
    }

    const dispatch = await generateRomeDispatch(date);
    const pollResults = await getRomeDispatchPoll(date);
    return NextResponse.json({ dispatch, pollResults, date });
  } catch (error) {
    console.error("[rome-dispatch] GET failed", error);
    return NextResponse.json({ dispatch: null, pollResults: {}, error: "Dispatch unavailable" });
  }
}
