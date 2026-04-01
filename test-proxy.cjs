const { drizzle } = require('drizzle-orm/pg-proxy');
const { pgTable, text, timestamp } = require('drizzle-orm/pg-core');
const { eq, desc } = require('drizzle-orm');

const PROXY_URL = 'https://hypubrbmtysnpkopixlc.supabase.co/functions/v1/sql-proxy';
const PROXY_SECRET = '1de96cb0e85bd797e1259f64168c2cef31cf20ceb48d38499dfe992074420753';

const db = drizzle(async (sql, params, method) => {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-proxy-secret': PROXY_SECRET },
    body: JSON.stringify({ sql, params, method }),
  });
  return response.json();
});

const spots = pgTable('spots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').default('approved').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

async function main() {
  // Test SELECT with WHERE
  const rows = await db.select().from(spots).where(eq(spots.status, 'approved')).orderBy(desc(spots.createdAt)).limit(3);
  console.log('SELECT OK:', rows.length, 'spots, first:', rows[0]?.name);

  // Test COUNT/GROUP BY
  const { count } = require('drizzle-orm');
  const cntRows = await db.select({ cnt: count(spots.id) }).from(spots).where(eq(spots.status, 'approved'));
  console.log('COUNT OK:', cntRows[0]?.cnt);

  // Test GROUP BY
  const grouped = await db.select({ neighborhood: spots.status, cnt: count(spots.id) }).from(spots).groupBy(spots.status);
  console.log('GROUP BY OK:', grouped);

  console.log('\nAll tests passed!');
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
