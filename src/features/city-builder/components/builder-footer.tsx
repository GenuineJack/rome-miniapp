export function BuilderFooter() {
  return (
    <footer className="bg-[#091f2f] text-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-5 mb-8">
          <a
            href="https://github.com/GenuineJack/boston-miniapp"
            target="_blank"
            rel="noopener noreferrer"
            className="t-sans text-xs font-bold uppercase tracking-[0.12em] text-[#288be4] hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://github.com/GenuineJack/boston-miniapp/blob/main/docs/CITY-BUILDER.md"
            target="_blank"
            rel="noopener noreferrer"
            className="t-sans text-xs font-bold uppercase tracking-[0.12em] text-[#288be4] hover:text-white transition-colors"
          >
            CITY-BUILDER.md
          </a>
          <span className="text-white/20">·</span>
          <a
            href="https://warpcast.com/genuinejack"
            target="_blank"
            rel="noopener noreferrer"
            className="t-sans text-xs font-bold uppercase tracking-[0.12em] text-[#288be4] hover:text-white transition-colors"
          >
            Farcaster
          </a>
        </div>

        <p className="t-serif text-sm text-white/60">
          Built by{" "}
          <a
            href="https://warpcast.com/genuinejack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#288be4] hover:text-white transition-colors"
          >
            GenuineJack
          </a>{" "}
          on Farcaster
        </p>

        <p className="t-serif text-[11px] text-white/30 mt-3">
          Open source · Fork it · Make it yours
        </p>
      </div>
    </footer>
  );
}
