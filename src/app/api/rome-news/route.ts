import { NextResponse } from "next/server";

const FEEDS = [
  { source: "RomaToday", url: "https://www.romatoday.it/rss/" },
  { source: "Rome Reports", url: "https://www.romereports.com/en/feed/" },
];

type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
};

function parseItems(xml: string, source: string): NewsItem[] {
  const rows: NewsItem[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of matches) {
    const item = match[1];
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>([^<]*)<\/title>/i);
    const linkMatch = item.match(/<link>([^<]*)<\/link>/i);
    const pubDateMatch = item.match(/<pubDate>([^<]*)<\/pubDate>/i);

    const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? "").trim();
    const link = (linkMatch?.[1] ?? "").trim();
    const pubDate = (pubDateMatch?.[1] ?? "").trim();

    if (title && link) {
      rows.push({ title, link, source, pubDate });
    }
  }
  return rows;
}

export async function GET() {
  const settled = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "Rome Miniapp/1.0 RSS Reader" },
        next: { revalidate: 1800 },
      });
      if (!response.ok) return [] as NewsItem[];
      const xml = await response.text();
      return parseItems(xml, feed.source);
    }),
  );

  const items = settled
    .filter((row): row is PromiseFulfilledResult<NewsItem[]> => row.status === "fulfilled")
    .flatMap((row) => row.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 3);

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=900" } },
  );
}
