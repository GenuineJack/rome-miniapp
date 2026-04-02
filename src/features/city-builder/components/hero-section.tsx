export function HeroSection() {
  return (
    <section className="bg-[#091f2f] text-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24 text-center">
        <div className="text-5xl sm:text-6xl mb-6">🏙️</div>

        <h1 className="t-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight -tracking-[0.02em]">
          Build Your City
        </h1>

        <p className="t-serif text-lg sm:text-xl mt-5 leading-relaxed max-w-2xl mx-auto text-white/75">
          Everything you need to launch a Farcaster community mini-app for your
          hometown. Fork the template, let AI do the research, and deploy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <a
            href="#get-started"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1871bd] hover:bg-[#288be4] text-white t-sans text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("get-started")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get Started
          </a>
          <a
            href="https://github.com/GenuineJack/boston-miniapp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 hover:border-white/60 text-white t-sans text-xs font-bold uppercase tracking-[0.15em] rounded-sm transition-colors"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
