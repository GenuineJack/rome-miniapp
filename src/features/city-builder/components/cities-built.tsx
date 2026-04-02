export function CitiesBuilt() {
  return (
    <section className="py-16 sm:py-20 border-t border-[#e0e0e0]">
      <h2 className="t-sans font-bold text-2xl sm:text-3xl text-[#091f2f] text-center tracking-tight">
        Cities Built
      </h2>
      <p className="t-serif text-[#828282] text-base text-center mt-2 mb-12">
        The growing network of city mini-apps on Farcaster
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Boston — flagship */}
        <div className="border-2 border-[#1871bd] rounded-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🦞</span>
            <div>
              <h3 className="t-sans font-bold text-lg text-[#091f2f]">
                Boston
              </h3>
              <span className="t-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[#1871bd]">
                Flagship
              </span>
            </div>
          </div>
          <p className="t-serif text-sm text-[#58585b] leading-relaxed mb-4">
            The original. 60+ spots, live MBTA alerts, Celtics &amp; Red Sox
            scores, daily dispatch, and a growing builder community.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-[#f3f3f3] px-2.5 py-1 rounded-sm t-sans font-semibold text-[#58585b]">
              60+ spots
            </span>
            <span className="text-xs bg-[#f3f3f3] px-2.5 py-1 rounded-sm t-sans font-semibold text-[#58585b]">
              5 sports teams
            </span>
            <span className="text-xs bg-[#f3f3f3] px-2.5 py-1 rounded-sm t-sans font-semibold text-[#58585b]">
              16 neighborhoods
            </span>
          </div>
        </div>

        {/* Your city CTA */}
        <div className="border-2 border-dashed border-[#e0e0e0] rounded-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
          <span className="text-5xl mb-4">🏙️</span>
          <h3 className="t-sans font-bold text-lg text-[#091f2f] mb-1">
            Your City Here
          </h3>
          <p className="t-serif text-sm text-[#828282] mb-5">
            Be the first to launch a mini-app for your hometown.
          </p>
          <a
            href="#get-started"
            className="t-sans text-xs font-bold uppercase tracking-[0.12em] text-[#1871bd] hover:underline"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("get-started")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get started →
          </a>
        </div>
      </div>
    </section>
  );
}
