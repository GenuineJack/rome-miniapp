const STEPS = [
  {
    num: "01",
    title: "Fork the Template",
    desc: "One-click fork on GitHub. You get the entire codebase — Next.js app, database schema, UI components, API routes, and deployment config.",
    icon: "🍴",
  },
  {
    num: "02",
    title: "Let AI Research Your City",
    desc: "Download the CITY-BUILDER.md skill file, load it into Claude, and say \"I want to build a mini-app for [your city].\" The AI interviews you, researches your city, and generates all the config files you need.",
    icon: "🤖",
  },
  {
    num: "03",
    title: "Deploy",
    desc: "Push to Vercel, connect your Postgres database, paste in your env vars, seed the data, and you're live. The whole process fits in a single session.",
    icon: "🚀",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 border-t border-[#e0e0e0]">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        How It Works
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-12">
        Three steps from zero to a live city app
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <div key={step.num} className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#091f2f] text-white flex items-center justify-center t-sans font-bold text-sm mx-auto mb-5">
              {step.num}
            </div>
            <div className="text-2xl mb-2">{step.icon}</div>
            <h3 className="t-sans font-bold text-sm uppercase tracking-[0.1em] text-[#091f2f] mb-2">
              {step.title}
            </h3>
            <p className="t-serif text-sm text-[#58585b] leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <p className="t-serif text-xs text-center mt-10 italic text-[#828282]">
        Developers can skip step 2 and configure manually — it&apos;s just one
        config file.
      </p>
    </section>
  );
}
