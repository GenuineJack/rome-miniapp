/* eslint-disable @neynar/no-process-env */
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzleProxy } from "drizzle-orm/pg-proxy";
import postgres from "postgres";
import * as schema from "@/db/schema";
import type { PgDatabase } from "drizzle-orm/pg-core";

/**
 * Database Connection and Client
 *
 * Connection priority:
 * 1. SQL_PROXY_URL + SQL_PROXY_SECRET — legacy HTTP proxy path (Supabase Edge Function).
 *    Only used if both vars are present. Kept for backwards compatibility.
 * 2. DATABASE_URL — direct Postgres connection. Use the Supabase connection pooler URL
 *    (port 6543, transaction mode) on Vercel for reliable IPv4 connectivity.
 *    `prepare: false` is already set, making it compatible with PgBouncer transaction mode.
 *
 * Recommended Vercel env for Supabase Pro:
 *   DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   (Remove SQL_PROXY_URL and SQL_PROXY_SECRET once DATABASE_URL is set)
 */

declare global {
  var __db: PgDatabase<any, typeof schema> | undefined;
  var __dbConnection: postgres.Sql | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: PgDatabase<any, typeof schema>;
let connection: postgres.Sql;

const sqlProxyUrl = process.env.SQL_PROXY_URL;
const sqlProxySecret = process.env.SQL_PROXY_SECRET;

if (sqlProxyUrl && sqlProxySecret) {
  // Legacy: Route queries through Supabase Edge Function over HTTPS
  db = drizzleProxy(
    async (sql, params, method) => {
      const response = await fetch(sqlProxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-proxy-secret": sqlProxySecret,
        },
        body: JSON.stringify({ sql, params, method }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`SQL proxy error (${response.status}): ${text}`);
      }

      const result = await response.json();
      if (result.error) throw new Error(`SQL proxy: ${result.error}`);
      return result;
    },
    { schema },
  );

  // Stub connection — not used in proxy mode
  connection = null as unknown as postgres.Sql;
} else if (process.env.DATABASE_URL) {
  // Detect if using Supabase connection pooler (port 6543) — transaction mode
  const isPooler = process.env.DATABASE_URL.includes(":6543");

  const pgOptions = {
    ssl: "require" as const,
    prepare: false, // required for PgBouncer transaction mode
    max: isPooler ? 1 : 10, // pooler handles connection management; 1 per serverless invocation
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: isPooler ? 30 : undefined, // release connections quickly in pooler mode
  };

  if (process.env.NODE_ENV === "production") {
    connection = postgres(process.env.DATABASE_URL, pgOptions);
    db = drizzlePg(connection, { schema });
  } else {
    // Dev: reuse connection across hot reloads
    if (!globalThis.__dbConnection) {
      globalThis.__dbConnection = postgres(process.env.DATABASE_URL, pgOptions);
      globalThis.__db = drizzlePg(globalThis.__dbConnection, { schema });
    }
    connection = globalThis.__dbConnection;
    db = globalThis.__db as PgDatabase<any, typeof schema>;
  }
} else {
  const createStub = () => {
    throw new Error(
      "DATABASE_URL environment variable is not set. Database operations are unavailable.",
    );
  };

  connection = createStub as unknown as postgres.Sql;
  db = createStub as unknown as PgDatabase<any, typeof schema>;
}

export { db, connection };
