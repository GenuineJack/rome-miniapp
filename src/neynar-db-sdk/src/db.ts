/* eslint-disable @neynar/no-process-env */
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzleProxy } from "drizzle-orm/pg-proxy";
import postgres from "postgres";
import * as schema from "@/db/schema";
import type { PgDatabase } from "drizzle-orm/pg-core";

/**
 * Database Connection and Client
 *
 * Uses direct Postgres connection locally and an HTTP SQL proxy on Vercel
 * (where IPv6-only Supabase connections are unreachable).
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
  // Production (Vercel): Route queries through Supabase Edge Function over HTTPS
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
  // Local development: Direct Postgres connection
  const pgOptions = {
    ssl: "require" as const,
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  };

  if (process.env.NODE_ENV === "production") {
    connection = postgres(process.env.DATABASE_URL, pgOptions);
    db = drizzlePg(connection, { schema });
  } else {
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
