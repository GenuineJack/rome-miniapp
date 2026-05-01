import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import type { MiniAppEmbedNext } from "@farcaster/miniapp-sdk";
import { db } from "@/neynar-db-sdk/db";
import { romeDispatchCache } from "@/db/schema";
import { publicConfig } from "@/config/public-config";

export const dynamic = "force-dynamic";

function buildMiniAppEmbed(title: string): MiniAppEmbedNext {
  return {
    version: "next",
    imageUrl: `${publicConfig.homeUrl}/api/share/image/farcaster`,
    button: {
      title: publicConfig.shareButtonTitle,
      action: {
        type: "launch_miniapp",
        name: title,
        url: `${publicConfig.homeUrl}?tab=dispatch`,
        splashImageUrl: publicConfig.splashImageUrl,
        splashBackgroundColor: publicConfig.splashBackgroundColor,
      },
    },
  };
}

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

  const title = `The Dispatch · ${formatPretty(date)}`;
  const row = await getDispatchForDate(date);
  const parsed = row ? parseDispatch(row.content) : null;
  const greeting =
    parsed?.greeting?.replace(/\s+/g, " ").slice(0, 200) || "Rome's daily dispatch.";
  const image = `${publicConfig.homeUrl}/api/share/image/og?date=${encodeURIComponent(
    formatPretty(date),
  )}&title=${encodeURIComponent(title)}`;

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
    other: {
      "fc:miniapp": JSON.stringify(buildMiniAppEmbed(title)),
    },
  };
}

export default async function DispatchByDatePage({ params }: PageProps) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const row = await getDispatchForDate(date);
  const parsed = row ? parseDispatch(row.content) : null;

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-5 border-b border-boston-gray-100 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest t-sans-red">The Dispatch</p>
          <h1 className="text-2xl font-semibold text-navy">{formatPretty(date)}</h1>
          <p className="mt-2 text-sm t-serif-quote">
            {parsed?.greeting ?? "Rome, today. Open the mini app for the full edition."}
          </p>
        </header>
        {parsed && Array.isArray(parsed.quickBriefing) && parsed.quickBriefing.length > 0 && (
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
        {!parsed && (
          <section>
            <p className="text-sm t-sans-navy">
              The full Dispatch lives inside the Rome mini app. Tap the launch button on
              Farcaster to read today&apos;s edition.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
