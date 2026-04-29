import "server-only";

import { setMonthlySlot, getMonthlyHappenings } from "@/db/actions/monthly-happenings-actions";

const MONTHLY_HAPPENINGS_SYSTEM_PROMPT = `You are the editor of The Dispatch, Rome's daily city briefing.
Each month you also publish a small editorial guide of "three noteworthy things happening in Rome this month."

Your output is always a single valid JSON object of this shape — no markdown fence, no preamble:

type MonthlyHappeningsOutput = {
  month: string;          // "April 2026"
  items: {
    slot: 1 | 2 | 3;
    emoji: string;        // single emoji
    title: string;        // 3-7 words. Specific. Not "Spring Activities".
    summary: string;      // 1-2 sentences for the card preview. Concrete.
    body: string;         // Markdown. 3-5 short paragraphs. Headings allowed (##).
                // Editorial, dry, Rome-native voice. No bullet salad.
                          // Include specific names, addresses, dates, neighborhoods.
                          // No links inside body — those go in sourceLinks.
    sourceLinks: { label: string; url: string }[]; // 1-4 real links. No fabrication.
  }[];                    // exactly 3 items, slots 1,2,3
};

VOICE: dry Rome wit, specific, never tourist-guide, never corporate civic.
Pick three things that matter THIS month — a festival, a season change, a real
event, a neighborhood inflection point. Avoid evergreen "things to do in Rome."

LINKS: only include URLs you can verify from your training data or that are
clearly canonical (comune.roma.it, atac.roma.it, the venue's own site, museums, news outlets).
If you are unsure, omit the link rather than fabricate.`;

type MonthlyAIItem = {
  slot: 1 | 2 | 3;
  emoji: string;
  title: string;
  summary: string;
  body: string;
  sourceLinks: { label: string; url: string }[];
};

type MonthlyAIOutput = {
  month: string;
  items: MonthlyAIItem[];
};

function monthLabel(monthStr: string): string {
  // monthStr: "2026-04" → "April 2026"
  const [y, m] = monthStr.split("-").map((s) => parseInt(s, 10));
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export type MonthlyGenerationResult = { ok: true; month: string; count: number } | { ok: false; error: string };

export async function generateMonthlyHappenings(options?: {
  month?: string;
  force?: boolean;
}): Promise<MonthlyGenerationResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return { ok: false, error: "ANTHROPIC_API_KEY not configured" };
  }

  // Default to current Rome month
  const month =
    options?.month ??
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
    }).format(new Date());

  // Idempotency unless forced
  if (!options?.force) {
    const existing = await getMonthlyHappenings(month);
    if (existing.length >= 3) {
      return { ok: true, month, count: existing.length };
    }
  }

  const userMessage = `Generate the "three noteworthy things in Rome" guide for ${monthLabel(month)} (month string: ${month}).
Use only verifiable information. If a fact is uncertain, omit it.
Return JSON only.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: MONTHLY_HAPPENINGS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[monthly-happenings] Anthropic error:", err);
    return { ok: false, error: "AI generation failed" };
  }

  const data = await response.json();
  let raw = (data.content?.[0]?.text ?? "").trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: MonthlyAIOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[monthly-happenings] invalid JSON:", raw.slice(0, 200));
    return { ok: false, error: "AI returned invalid JSON" };
  }

  if (!parsed.items || !Array.isArray(parsed.items)) {
    return { ok: false, error: "AI response missing items array" };
  }

  let inserted = 0;
  for (const item of parsed.items) {
    if (!item.slot || !item.title || !item.body) continue;
    try {
      await setMonthlySlot({
        month,
        slot: item.slot,
        title: item.title,
        emoji: item.emoji || "📅",
        summary: item.summary ?? "",
        body: item.body,
        sourceLinks: Array.isArray(item.sourceLinks) ? item.sourceLinks : [],
      });
      inserted++;
    } catch (e) {
      console.error("[monthly-happenings] insert failed for slot", item.slot, e);
    }
  }

  return { ok: true, month, count: inserted };
}
