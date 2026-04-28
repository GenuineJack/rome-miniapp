import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDispatchForDate } from "@/db/actions/dispatch-actions";
import { getSpots } from "@/db/actions/boston-actions";
import { WhatsNewTab } from "@/features/boston/tabs/whats-new-tab";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ date: string }> };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatPretty(date: string): string {
  // Display in ET-friendly long format
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(Date.UTC(y, m - 1, d, 12)); // noon UTC avoids DST flip
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  if (!DATE_RE.test(date)) return { title: "Dispatch · Boston" };

  const row = await getDispatchForDate(date);
  if (!row) {
    return {
      title: `Dispatch · ${formatPretty(date)}`,
      description: "Boston's daily dispatch.",
    };
  }

  let greeting = "Boston's daily dispatch.";
  try {
    const parsed = JSON.parse(row.content) as { greeting?: string };
    if (typeof parsed.greeting === "string") {
      greeting = parsed.greeting.replace(/\s+/g, " ").slice(0, 200);
    }
  } catch {
    /* noop */
  }

  return {
    title: `The Dispatch · ${formatPretty(date)}`,
    description: greeting,
    openGraph: {
      title: `The Dispatch · ${formatPretty(date)}`,
      description: greeting,
      images: ["/api/share/image/og"],
    },
    twitter: {
      card: "summary_large_image",
      title: `The Dispatch · ${formatPretty(date)}`,
      description: greeting,
      images: ["/api/share/image/og"],
    },
  };
}

export default async function DispatchByDatePage({ params }: PageProps) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const row = await getDispatchForDate(date);
  if (!row) notFound();

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.content);
  } catch {
    notFound();
  }

  // Spots are needed so the Place-of-the-Day card can deep-link.
  const spots = await getSpots({ limit: 500 }).catch(() => []);

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-2xl">
        <WhatsNewTab
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialDispatch={parsed as any}
          spots={spots}
        />
      </div>
    </main>
  );
}
