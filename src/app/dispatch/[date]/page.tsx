import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/neynar-db-sdk/db";
import { romeDispatchCache } from "@/db/schema";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ date: string }> };

type DispatchSnapshot = {
  greeting?: string;
  quickBriefing?: string[];
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatPretty(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Europe/Rome",
  });
}

async function getDispatchForDate(date: string) {
  const [row] = await db.select().from(romeDispatchCache).where(eq(romeDispatchCache.date, date)).limit(1);
  return row ?? null;
}

function parseDispatch(value: string): DispatchSnapshot | null {
  try {
    return JSON.parse(value) as DispatchSnapshot;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_RE.test(date)) return { title: "Dispatch · Rome" };

  const row = await getDispatchForDate(date);
  if (!row) {
    return {
      title: `Dispatch · ${formatPretty(date)}`,
      description: "Rome's daily dispatch.",
    };
  }

  const parsed = parseDispatch(row.content);
  const greeting = parsed?.greeting?.replace(/\s+/g, " ").slice(0, 200) || "Rome's daily dispatch.";
  const title = `The Dispatch · ${formatPretty(date)}`;
  const image = `/api/share/image/og?date=${encodeURIComponent(formatPretty(date))}&title=${encodeURIComponent(title)}`;

  return {
    title,
    description: greeting,
    openGraph: {
      title,
      description: greeting,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: greeting,
      images: [image],
    },
  };
}

export default async function DispatchByDatePage({ params }: PageProps) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const row = await getDispatchForDate(date);
  if (!row) notFound();

  const parsed = parseDispatch(row.content);
  if (!parsed) notFound();

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-5 border-b border-boston-gray-100 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest t-sans-red">The Dispatch</p>
          <h1 className="text-2xl font-semibold text-navy">{formatPretty(date)}</h1>
          <p className="mt-2 text-sm t-serif-quote">{parsed.greeting ?? "Rome, today."}</p>
        </header>
        {Array.isArray(parsed.quickBriefing) && parsed.quickBriefing.length > 0 && (
          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest t-sans-gray">Quick Briefing</h2>
            <ul className="space-y-2">
              {parsed.quickBriefing.map((line, index) => (
                <li key={index} className="text-sm leading-relaxed t-sans-navy">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
