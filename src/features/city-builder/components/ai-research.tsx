const RESEARCH_ITEMS = [
  { text: "50+ local spots with addresses, coordinates, and descriptions", emoji: "📍" },
  { text: "Neighborhood map with boundaries and character descriptions", emoji: "🗺" },
  { text: "Local news RSS feeds (newspapers, radio, hyperlocal blogs)", emoji: "📰" },
  { text: "Transit API integration — or graceful fallback if none exists", emoji: "🚇" },
  { text: "Sports teams, leagues, and seasons", emoji: "⚾" },
  { text: "Seasonal events and recurring happenings with dates", emoji: "🎉" },
  { text: "City editorial voice for the daily dispatch", emoji: "✍️" },
  { text: "Color theme scraped from your city's .gov website CSS", emoji: "🎨" },
  { text: "Complete deployment configuration and environment setup", emoji: "⚙️" },
];

export function AiResearch() {
  return (
    <section className="py-16 sm:py-20 border-t border-[#e0e0e0]">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        What the AI Builds For You
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-12">
        Load the skill doc into Claude — it handles the research
      </p>

      <div className="max-w-2xl mx-auto bg-[#f3f3f3] rounded-sm p-8">
        <div className="flex flex-col gap-4">
          {RESEARCH_ITEMS.map((item) => (
            <div key={item.text} className="flex items-start gap-4">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0 flex items-start gap-2">
                <span className="text-[#1871bd] font-bold text-base mt-px flex-shrink-0">
                  ✓
                </span>
                <p className="t-serif text-sm text-[#58585b] leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-[#e0e0e0]">
          <p className="t-sans text-xs text-center text-[#828282] uppercase tracking-[0.15em] font-bold">
            One config file. That&apos;s all you change.
          </p>
        </div>
      </div>
    </section>
  );
}
