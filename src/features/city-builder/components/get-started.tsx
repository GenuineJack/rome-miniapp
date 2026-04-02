const API_KEYS = [
  { name: "Neynar API Key", desc: "Farcaster authentication and social features", required: true },
  { name: "Database URL", desc: "PostgreSQL (Vercel Postgres or Supabase)", required: true },
  { name: "OpenAI API Key", desc: "Powers the daily dispatch AI generation", required: true },
  { name: "Transit API Key", desc: "City-specific — MBTA, CTA, BART, etc.", required: false },
];

export function GetStarted() {
  return (
    <section id="get-started" className="py-16 sm:py-20 border-t border-[#e0e0e0]">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        Get Started
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-12">
        Choose your path
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {/* AI-guided path */}
        <div className="border-2 border-[#1871bd] rounded-sm p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <span className="t-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#1871bd]">
              Recommended
            </span>
          </div>
          <h3 className="t-sans font-bold text-lg text-[#091f2f] mb-2">
            AI-Guided Setup
          </h3>
          <p className="t-serif text-sm text-[#58585b] leading-relaxed mb-6 flex-1">
            Download the CITY-BUILDER.md skill file, load it into Claude, and
            tell it your city. The AI interviews you, researches everything, and
            generates your config files.
          </p>
          <a
            href="https://github.com/GenuineJack/boston-miniapp/blob/main/docs/CITY-BUILDER.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-[#091f2f] hover:bg-[#1871bd] text-white t-sans text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-colors w-full"
          >
            Download CITY-BUILDER.md ↗
          </a>
        </div>

        {/* Manual path */}
        <div className="border-2 border-[#e0e0e0] rounded-sm p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🛠</span>
            <span className="t-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#828282]">
              For Developers
            </span>
          </div>
          <h3 className="t-sans font-bold text-lg text-[#091f2f] mb-2">
            Manual Setup
          </h3>
          <p className="t-serif text-sm text-[#58585b] leading-relaxed mb-6 flex-1">
            Fork the repo, edit the config file directly, set up your own seed
            data, and deploy. Full control, no AI required.
          </p>
          <a
            href="https://github.com/GenuineJack/boston-miniapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-[#091f2f] hover:bg-[#091f2f] hover:text-white text-[#091f2f] t-sans text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-colors w-full"
          >
            Fork on GitHub ↗
          </a>
        </div>
      </div>

      {/* API keys needed */}
      <div className="max-w-2xl mx-auto border-2 border-[#e0e0e0] rounded-sm p-6 sm:p-8">
        <h3 className="t-sans text-xs font-bold uppercase tracking-[0.12em] text-[#091f2f] mb-5">
          API Keys You&apos;ll Need
        </h3>
        <div className="flex flex-col gap-4">
          {API_KEYS.map((key) => (
            <div key={key.name} className="flex items-start gap-4">
              <span
                className={`t-sans text-[11px] font-bold mt-1 flex-shrink-0 tracking-wider ${
                  key.required ? "text-[#1871bd]" : "text-[#828282]"
                }`}
              >
                {key.required ? "REQUIRED" : "OPTIONAL"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="t-sans text-sm font-semibold text-[#091f2f]">
                  {key.name}
                </p>
                <p className="t-serif text-xs text-[#828282]">{key.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
