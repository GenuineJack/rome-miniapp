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
  const date = getRomeDate();
  const cached = await getCachedRomeDispatch(date);

  if (cached) {
    const pollResults = await getRomeDispatchPoll(date);
    return NextResponse.json({ dispatch: cached, pollResults, date });
  }

  if (getRomeHour() < 7) {
    return NextResponse.json({ dispatch: null, pollResults: {}, date });
  }

  const dispatch = await generateRomeDispatch(date);
  const pollResults = await getRomeDispatchPoll(date);
  return NextResponse.json({ dispatch, pollResults, date });
}
