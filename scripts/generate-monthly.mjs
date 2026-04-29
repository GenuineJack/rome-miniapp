/**
 * Standalone script to generate monthly happenings for the current month.
 * Run: node scripts/generate-monthly.mjs
 */
import { readFileSync } from 'fs';
import postgres from '../node_modules/.pnpm/postgres@3.4.7/node_modules/postgres/src/index.js';
import { randomUUID } from 'crypto';

// Load env vars from .env.local and .env
function loadEnv() {
  const env = {};
  for (const file of ['.env', '.env.local']) {
    try {
      const lines = readFileSync(file, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        env[key] = val;
      }
    } catch { /* file doesn't exist */ }
  }
  return env;
}

const env = loadEnv();
const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
if (!ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }

const SYSTEM_PROMPT = `You are the editor of The Dispatch, Boston's daily city briefing.
Each month you also publish a small editorial guide of "three noteworthy things happening in Boston this month."

Your output is always a single valid JSON object of this shape — no markdown fence, no preamble:

type MonthlyHappeningsOutput = {
  month: string;          // "April 2026"
  items: {
    slot: 1 | 2 | 3;
    emoji: string;        // single emoji
    title: string;        // 3-7 words. Specific. Not "Spring Activities".
    summary: string;      // 1-2 sentences for the card preview. Concrete.
    body: string;         // Markdown. 3-5 short paragraphs. Headings allowed (##).
                          // Editorial, dry, Boston-native voice. No bullet salad.
                          // Include specific names, addresses, dates, neighborhoods.
                          // No links inside body — those go in sourceLinks.
    sourceLinks: { label: string; url: string }[]; // 1-4 real links. No fabrication.
  }[];                    // exactly 3 items, slots 1,2,3
};

VOICE: dry Boston wit, specific, never tourist-guide, never corporate civic.
Pick three things that matter THIS month — a festival, a season change, a real
event, a neighborhood inflection point. Avoid evergreen "things to do in Boston."

LINKS: only include URLs you can verify from your training data or that are
clearly canonical (boston.gov, mbta.com, the venue's own site, museums, news outlets).
If you are unsure, omit the link rather than fabricate.`;

function getMonthLabel(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function getCurrentMonth() {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
  }).format(now);
}

const month = process.argv[2] || getCurrentMonth();
const label = getMonthLabel(month);
console.log(`Generating monthly happenings for ${label} (${month})...`);

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 10 });

// Check if already exists
const existing = await sql`SELECT COUNT(*) as cnt FROM monthly_happenings WHERE month = ${month}`;
const count = parseInt(existing[0].cnt);
if (count >= 3) {
  console.log(`Already have ${count} items for ${month}. Pass month arg to override (e.g. node scripts/generate-monthly.mjs 2026-04)`);
  await sql.end();
  process.exit(0);
}

// Call Claude
console.log('Calling Anthropic API...');
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate the "three noteworthy things in Boston" guide for ${label} (month string: ${month}). Use only verifiable information. Return JSON only.`
    }],
  }),
});

if (!response.ok) {
  const err = await response.text();
  console.error('Anthropic error:', err);
  await sql.end();
  process.exit(1);
}

const data = await response.json();
let raw = (data.content?.[0]?.text ?? '').trim();
if (raw.startsWith('```')) {
  raw = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error('Invalid JSON from AI:', raw.slice(0, 300));
  await sql.end();
  process.exit(1);
}

if (!parsed.items || !Array.isArray(parsed.items)) {
  console.error('Missing items array in response');
  await sql.end();
  process.exit(1);
}

// Delete any partial existing rows first
await sql`DELETE FROM monthly_happenings WHERE month = ${month}`;

// Insert the 3 items
let inserted = 0;
for (const item of parsed.items) {
  if (!item.slot || !item.title || !item.body) continue;
  await sql`
    INSERT INTO monthly_happenings (id, month, slot, title, emoji, summary, body, source_links, created_at)
    VALUES (
      ${randomUUID()},
      ${month},
      ${item.slot},
      ${item.title},
      ${item.emoji || '📅'},
      ${item.summary || ''},
      ${item.body},
      ${JSON.stringify(Array.isArray(item.sourceLinks) ? item.sourceLinks : [])},
      now()
    )
  `;
  console.log(`  ✓ Slot ${item.slot}: ${item.title}`);
  inserted++;
}

console.log(`\nDone! Inserted ${inserted}/3 monthly happenings for ${label}.`);
await sql.end();
