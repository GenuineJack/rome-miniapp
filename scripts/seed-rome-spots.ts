import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";

const SUBMITTER_FID = 218957;
const SUBMITTER_USERNAME = "genuinejack";
const SUBMITTER_DISPLAY_NAME = "Genuine Jack";
const SUBMITTER_PFP_URL =
  "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/533a424d-d6f8-4c6a-30ec-7658555db700/original";

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function main() {
  const { db } = await import("../src/neynar-db-sdk/src/db.js");
  const { romeSpots } = await import("../src/db/schema.js");

  if (typeof (db as unknown as { select?: unknown }).select !== "function") {
    throw new Error("Database is not configured. Export DATABASE_URL before running this script.");
  }

  const csvPath = path.join(process.cwd(), "public", "spots_seed.rome.csv");
  const csv = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csv);

  const existingRows = await db.select({ id: romeSpots.id }).from(romeSpots);
  const existing = new Set(existingRows.map((row) => row.id));

  let inserted = 0;
  let updated = 0;

  for (const row of rows) {
    const id = row.id;
    if (!id) continue;

    const contentFields = {
      name: row.name,
      category: row.category,
      subcategory: row.subcategory || null,
      neighborhood: row.neighborhood,
      description: row.description,
      address: row.address || null,
      link: row.link || null,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
    };

    if (existing.has(id)) {
      await db.update(romeSpots).set(contentFields).where(eq(romeSpots.id, id));
      updated++;
      continue;
    }

    await db.insert(romeSpots).values({
      id,
      ...contentFields,
      submittedByFid: SUBMITTER_FID,
      submittedByUsername: SUBMITTER_USERNAME,
      submittedByDisplayName: SUBMITTER_DISPLAY_NAME,
      submittedByPfpUrl: SUBMITTER_PFP_URL,
      featured: row.featured?.toLowerCase() === "true",
      status: row.status || "approved",
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    });

    inserted++;
  }

  console.log(`seed-rome-spots complete. inserted=${inserted} updated=${updated}`);
}

main().catch((error) => {
  console.error("seed-rome-spots failed", error);
  process.exit(1);
});
