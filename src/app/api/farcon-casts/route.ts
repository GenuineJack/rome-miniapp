/* eslint-disable @neynar/no-process-env */

import { NextResponse } from "next/server";

type Cast = {
  text: string;
  author: { username: string; pfp_url?: string | null };
  timestamp: string;
  reactions: { likes_count: number };
  hash: string;
};

function normalizeCasts(payload: unknown): Cast[] {
  const obj = payload as { casts?: unknown[]; feed?: { casts?: unknown[] } };
  const list = (obj.casts ?? obj.feed?.casts ?? []) as Array<Record<string, unknown>>;

  return list.slice(0, 7).map((cast) => ({
    text: String(cast.text ?? ""),
    author: {
      username: String((cast.author as Record<string, unknown> | undefined)?.username ?? "unknown"),
      pfp_url: ((cast.author as Record<string, unknown> | undefined)?.pfp_url as string | null | undefined) ?? null,
    },
    timestamp: String(cast.timestamp ?? ""),
    reactions: {
      likes_count: Number((cast.reactions as Record<string, unknown> | undefined)?.likes_count ?? 0),
    },
    hash: String(cast.hash ?? ""),
  }));
}

export async function GET() {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ casts: [] }, { status: 200 });
  }

  const url = new URL("https://api.neynar.com/v2/farcaster/feed/channels");
  url.searchParams.set("channel_ids", "farcon-rome");
  url.searchParams.set("limit", "7");
  url.searchParams.set("sort_type", "engagement");

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        api_key: apiKey,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json({ casts: [] }, { status: 200 });
    }

    const payload = await response.json();
    const casts = normalizeCasts(payload);
    return NextResponse.json({ casts });
  } catch {
    return NextResponse.json({ casts: [] }, { status: 200 });
  }
}
