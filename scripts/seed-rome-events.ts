export {};

const { db } = await import("../src/neynar-db-sdk/src/db.js");
const { romeEvents } = await import("../src/db/schema.js");

const EVENTS = [
  {
    id: "rome-event-web3privacy-now-meetup",
    title: "Web3Privacy Now Rome Meetup",
    description:
      "Half-day meetup on privacy, cryptography, and public goods with talks, open debate, and aperitivo networking.",
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
      "A full-day creative collab with live music, wax carving, and visual jam sessions hosted by Kismet Casa and Urbe.",
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
      "Community circle focused on civil society, Farcaster ecosystem participation, and Logos movement collaboration.",
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
      "Relaxed 5km social run along the Tiber before Farcon, with coffee and bagels after the route.",
    location: "Industrie Fluviali - Ecosistema Cultura",
    address: "Via del Porto Fluviale 35, 00154 Roma RM, Italy",
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
      "Higher Athletics community 5k social run for Farcon attendees with a conversational pace and group route.",
    location: "FarCon Rome",
    address: "Via del Porto Fluviale 35, 00154 Roma RM, Italy",
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
      "Beginner-friendly workshop decoding natal charts through planets, signs, and houses with open Q and A.",
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
    title: "Sigil Ring Workshop with tinyrainboot",
    description:
      "Hands-on wax carving workshop to design and craft a personal sigil ring with small-group guidance.",
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
      "Deep dive with Ethereum Foundation researchers on post-quantum cryptography plans for Ethereum security.",
    location: "Urbe Hub",
    address: "Roma, Italy",
    date: "2026-05-08",
    startTime: "17:00",
    endTime: "18:00",
    lumaUrl: "https://lu.ma/nhxuwei8",
    category: "side-event",
    featured: false,
  },
] as const;

async function main() {
  const existingRows = await db.select({ id: romeEvents.id }).from(romeEvents);
  const existing = new Set(existingRows.map((row) => row.id));

  let inserted = 0;
  let skipped = 0;

  for (const event of EVENTS) {
    if (existing.has(event.id)) {
      skipped++;
      continue;
    }

    await db.insert(romeEvents).values({
      ...event,
      organizerName: null,
      submittedByFid: 218957,
      submittedByUsername: "genuinejack",
      status: "approved",
      createdAt: new Date(),
    });

    inserted++;
  }

  console.log(`seed-rome-events complete. inserted=${inserted} skipped=${skipped}`);
}

main().catch((error) => {
  console.error("seed-rome-events failed", error);
  process.exit(1);
});
