const STACK = [
  { label: "Framework", value: "Next.js 15 + React 19" },
  { label: "Protocol", value: "Farcaster Mini-App SDK" },
  { label: "Database", value: "PostgreSQL via Drizzle ORM" },
  { label: "Hosting", value: "Vercel (or any Node host)" },
  { label: "UI", value: "Sketch component library + Tailwind" },
  { label: "AI", value: "OpenAI for daily dispatch generation" },
  { label: "Transit", value: "Pluggable adapters (MBTA, GTFS, custom, or none)" },
  { label: "State", value: "Jotai + React Query" },
];

const FILES = [
  {
    icon: "📁",
    name: "city.config.ts",
    desc: "Every city-specific value in one file — neighborhoods, feeds, teams, theme, voice",
  },
  {
    icon: "🗄️",
    name: "spots_seed.csv",
    desc: "Your city's initial spots — AI generates 50+ entries with coordinates and descriptions",
  },
  {
    icon: "🎨",
    name: "Theme colors",
    desc: "Scraped from your city's .gov site and applied across every component",
  },
];

export function Architecture() {
  return (
    <section className="py-16 sm:py-20 border-t border-[#e0e0e0]">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        Under the Hood
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-12">
        Production-ready stack, fully open source
      </p>

      {/* Tech stack grid */}
      <div className="border-2 border-[#e0e0e0] rounded-sm p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {STACK.map((item) => (
            <div key={item.label}>
              <span className="t-sans text-[9px] font-bold uppercase tracking-[0.1em] text-[#828282] block mb-1">
                {item.label}
              </span>
              <span className="t-sans text-sm font-semibold text-[#091f2f]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key files */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FILES.map((f) => (
          <div
            key={f.name}
            className="border border-[#e0e0e0] rounded-sm p-5 flex items-start gap-3"
          >
            <span className="text-xl flex-shrink-0">{f.icon}</span>
            <div>
              <p className="t-sans text-xs font-bold uppercase tracking-[0.08em] text-[#091f2f] mb-1">
                {f.name}
              </p>
              <p className="t-serif text-xs text-[#828282] leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
