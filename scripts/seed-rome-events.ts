export {};

type SeedEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string | null;
  date: string;
  startTime: string;
  endTime: string;
  lumaUrl: string;
  category: "farcon" | "community" | "side-event";
  featured: boolean;
};

const EVENTS = [
  {
    id: "rome-event-web3privacy-now-meetup",
    title: "Web3Privacy now Rome Meetup",
    description:
      "Half-day session on cryptography, open-source public goods, and civil liberties with talks, debate, and networking aperitivo.",
    location: "Urbe Hub",
    address: "Largo Dino Frisullo, 00153 Roma RM, Italy",
    date: "2026-05-08",
    startTime: "17:30",
    endTime: "21:00",
    lumaUrl: "https://lu.ma/q1sdbqf3",
    category: "side-event",
    featured: false,
  },
  {
    id: "rome-event-open-studio-day",
    title: "Open Studio Day",
    description:
      "Open studio collab day with Kismet Casa and Urbe featuring live acoustic music, wax carving, and visual jam sessions.",
    location: "Urbe Hub",
    address: "Largo Dino Frisullo, 00153 Roma RM, Italy",
    date: "2026-05-03",
    startTime: "14:00",
    endTime: "22:00",
    lumaUrl: "https://lu.ma/cg1lgqvs",
    category: "farcon",
    featured: true,
  },
  {
    id: "rome-event-logos-circle-farcon-edition",
    title: "Logos Circle Rome: Farcon Edition",
    description:
      "Community circle on civil society and Farcaster ecosystem participation, hosted at Urbe Hub the day before Farcon.",
    location: "Urbe Hub",
    address: "Largo Dino Frisullo, 00153 Roma RM, Italy",
    date: "2026-05-03",
    startTime: "12:00",
    endTime: "14:00",
    lumaUrl: "https://lu.ma/mrl5xefu",
    category: "farcon",
    featured: false,
  },
  {
    id: "rome-event-farcon-irl-morning-run",
    title: "Farcon Rome /IRL Morning Run",
    description:
      "Relaxed 5km morning run along the Tiber before Farcon, followed by coffee and bagels.",
    location: "Industrie Fluviali - Ecosistema Cultura",
    address: "Via del Porto Fluviale, 35, 00154 Roma RM, Italy",
    date: "2026-05-03",
    startTime: "08:00",
    endTime: "09:30",
    lumaUrl: "https://lu.ma/n353siyl",
    category: "farcon",
    featured: false,
  },
  {
    id: "rome-event-claim-the-city-5k",
    title: "Claim the City: 5k Social Run",
    description:
      "Higher Athletics community 5k social run at Farcon Rome with a conversational pace and group route.",
    location: "FarCon Rome",
    address: null,
    date: "2026-05-05",
    startTime: "06:30",
    endTime: "08:00",
    lumaUrl: "https://lu.ma/6202tei5",
    category: "community",
    featured: false,
  },
  {
    id: "rome-event-decode-yourself",
    title: "Decode Yourself",
    description:
      "Beginner-friendly natal-chart workshop covering planets, signs, and houses, followed by open Q&A.",
    location: "Urbe Hub",
    address: "Largo Dino Frisullo, 00153 Roma RM, Italy",
    date: "2026-05-06",
    startTime: "14:00",
    endTime: "15:30",
    lumaUrl: "https://lu.ma/lp1gmuiq",
    category: "farcon",
    featured: false,
  },
  {
    id: "rome-event-sigil-ring-workshop",
    title: "sigil ring workshop with tinyrainboot",
    description:
      "Hands-on wax carving workshop to design a personal sigil ring; casting and shipping are handled after the session.",
    location: "Urbe Hub",
    address: "Largo Dino Frisullo, 00153 Roma RM, Italy",
    date: "2026-05-06",
    startTime: "15:30",
    endTime: "18:30",
    lumaUrl: "https://lu.ma/m873ggkq",
    category: "farcon",
    featured: true,
  },
  {
    id: "rome-event-post-quantum-ethereum",
    title: "Post-Quantum Ethereum Meetup in Rome",
    description:
      "Meetup with Ethereum Foundation researchers covering post-quantum risks and the protocol's durable-cryptography roadmap.",
    location: "Roma, Italy",
    address: "Roma, Italy",
    date: "2026-05-08",
    startTime: "17:00",
    endTime: "18:00",
    lumaUrl: "https://lu.ma/nhxuwei8",
    category: "side-event",
    featured: false,
  },
] satisfies ReadonlyArray<SeedEvent>;

async function main() {
  const [{ eq }, { db }, { romeEvents }] = await Promise.all([
    import("drizzle-orm"),
    import("../src/neynar-db-sdk/src/db.js"),
    import("../src/db/schema.js"),
  ]);

  if (typeof (db as unknown as { select?: unknown }).select !== "function") {
    throw new Error("Database is not configured. Export DATABASE_URL before running this script.");
  }

  const existingRows = await db.select({ id: romeEvents.id }).from(romeEvents);
  const existing = new Set(existingRows.map((row) => row.id));

  let inserted = 0;
  let updated = 0;

  for (const event of EVENTS) {
    const values = {
      ...event,
      organizerName: null,
      submittedByFid: 218957,
      submittedByUsername: "genuinejack",
      status: "approved" as const,
    };

    if (existing.has(event.id)) {
      await db.update(romeEvents).set(values).where(eq(romeEvents.id, event.id));
      updated++;
      continue;
    }

    await db.insert(romeEvents).values({
      ...values,
      createdAt: new Date(),
    });

    inserted++;
  }

  console.log(
    `seed-rome-events complete. inserted=${inserted} updated=${updated} total=${EVENTS.length}`,
  );
}

main().catch((error) => {
  console.error("seed-rome-events failed", error);
  process.exit(1);
});
