const FEATURES = [
  {
    emoji: "🗺",
    title: "Explore Tab",
    desc: "Interactive map with community-submitted spots — restaurants, cafes, parks, venues, hidden gems.",
  },
  {
    emoji: "🏘",
    title: "Neighborhoods",
    desc: "Browse your city's distinct areas with descriptions, curated picks, and spot counts.",
  },
  {
    emoji: "☀️",
    title: "Today Tab",
    desc: "Weather, transit alerts, local sports scores, community events, and top news — all live.",
  },
  {
    emoji: "👥",
    title: "Builders Directory",
    desc: "A directory of your city's Farcaster community members and what they're building.",
  },
  {
    emoji: "📰",
    title: "Daily Dispatch",
    desc: "AI-generated daily newsletter with local flavor, sports recaps, and editorial voice.",
  },
  {
    emoji: "📝",
    title: "Community Submissions",
    desc: "Let your community add their favorite spots and events. Moderation built in.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-16 sm:py-20">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        What You Get
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-10">
        A complete community mini-app — out of the box
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="border-2 border-[#e0e0e0] rounded-sm p-6 hover:border-[#1871bd] transition-colors"
          >
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="t-sans font-bold text-xs uppercase tracking-[0.1em] text-[#091f2f] mb-2">
              {f.title}
            </h3>
            <p className="t-serif text-sm text-[#58585b] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
