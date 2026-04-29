"use client";

import { useEffect, useMemo, useState } from "react";

type VivereSubTab = "home" | "currency" | "phrases" | "around" | "stay";

type FiatResponse = {
  rates: Record<string, number>;
};

type CryptoResponse = {
  ethereum?: { usd?: number; eur?: number };
  bitcoin?: { usd?: number; eur?: number };
  solana?: { usd?: number; eur?: number };
};

type Phrase = {
  id: string;
  category: "Getting Around" | "Eating & Drinking" | "Being Polite" | "Builder Banter";
  italian: string;
  english: string;
  phonetic: string;
  example: string;
};

type ConversionRow = {
  code: "USD" | "EUR" | "GBP" | "ETH" | "BTC" | "USDC" | "SOL";
  label: string;
  rate: number | null;
  value: number | null;
};

type ConversionDefinition = Omit<ConversionRow, "value">;

const QUICK_AMOUNTS = [25, 50, 100, 250] as const;

const PHRASES: Phrase[] = [
  {
    id: "metro",
    category: "Getting Around",
    italian: "Dov'e la metro?",
    english: "Where is the metro?",
    phonetic: "doh-VEH lah MEH-troh",
    example: "Dov'e la metro per Piramide?",
  },
  {
    id: "coffee",
    category: "Eating & Drinking",
    italian: "Un caffe, per favore",
    english: "One coffee, please",
    phonetic: "oon kahf-FEH pehr fah-VOH-reh",
    example: "Un caffe, per favore. Subito.",
  },
  {
    id: "check",
    category: "Eating & Drinking",
    italian: "Il conto, per favore",
    english: "The check, please",
    phonetic: "eel KOHN-toh pehr fah-VOH-reh",
    example: "Siamo pronti. Il conto, per favore.",
  },
  {
    id: "cost",
    category: "Getting Around",
    italian: "Quanto costa?",
    english: "How much does it cost?",
    phonetic: "KWAN-toh KOH-stah",
    example: "Quanto costa fino a Ostiense?",
  },
  {
    id: "english",
    category: "Being Polite",
    italian: "Parla inglese?",
    english: "Do you speak English?",
    phonetic: "PAR-lah een-GLAY-zeh",
    example: "Mi scusi, parla inglese?",
  },
  {
    id: "lost",
    category: "Getting Around",
    italian: "Scusi, mi sono perso",
    english: "Excuse me, I'm lost",
    phonetic: "SKOO-zee mee SOH-noh PEHR-soh",
    example: "Scusi, mi sono perso vicino al Tevere.",
  },
  {
    id: "future",
    category: "Builder Banter",
    italian: "Stiamo costruendo il futuro",
    english: "We're building the future",
    phonetic: "STYAH-moh koh-stroo-EN-doh eel foo-TOO-roh",
    example: "A Farcon stiamo costruendo il futuro.",
  },
  {
    id: "round",
    category: "Eating & Drinking",
    italian: "Un altro giro?",
    english: "Another round?",
    phonetic: "oon AL-troh JEE-roh",
    example: "Post-demo: un altro giro?",
  },
  {
    id: "station",
    category: "Getting Around",
    italian: "Dove la stazione Ostiense?",
    english: "Where is Ostiense station?",
    phonetic: "DOH-veh lah stah-TSYOH-neh ohs-tee-EN-seh",
    example: "Dove la stazione Ostiense, per favore?",
  },
  {
    id: "water",
    category: "Eating & Drinking",
    italian: "Acqua frizzante o naturale?",
    english: "Sparkling or still water?",
    phonetic: "AH-kwah freet-TSAHN-teh oh nah-too-RAH-leh",
    example: "Acqua frizzante, grazie.",
  },
  {
    id: "thanks",
    category: "Being Polite",
    italian: "Grazie mille",
    english: "Thank you very much",
    phonetic: "GRAHT-tsyeh MEEL-leh",
    example: "Grazie mille per l'aiuto.",
  },
  {
    id: "ship",
    category: "Builder Banter",
    italian: "Shippiamo stanotte",
    english: "We ship tonight",
    phonetic: "shee-PYAH-moh stah-NOT-teh",
    example: "Demo domani, shippiamo stanotte.",
  },
];

const SUB_TABS: { id: VivereSubTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "currency", label: "Currency" },
  { id: "phrases", label: "Phrases" },
  { id: "around", label: "Around" },
  { id: "stay", label: "Stay" },
];

const NAV_CARDS: { id: VivereSubTab; title: string; description: string }[] = [
  { id: "currency", title: "Currency", description: "Fiat + crypto converter" },
  { id: "phrases", title: "Phrases", description: "12 Italian essentials" },
  { id: "around", title: "Getting Around", description: "Metro, bus, taxi & airport" },
  { id: "stay", title: "Stay & Hotels", description: "Neighborhoods + partner hotel deals" },
];

export function VivereTab() {
  const [vivereSubTab, setVivereSubTab] = useState<VivereSubTab>("home");
  const [baseCurrency, setBaseCurrency] = useState<"USD" | "EUR">("USD");
  const [amount, setAmount] = useState("100");
  const [fiatRates, setFiatRates] = useState<Record<string, number>>({});
  const [cryptoRates, setCryptoRates] = useState<CryptoResponse>({});
  const [fiatLoading, setFiatLoading] = useState(true);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [fiatError, setFiatError] = useState<string | null>(null);
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setFiatLoading(true);
    setFiatError(null);

    fetch(`/api/fiat-rates?base=${baseCurrency}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Fiat rates request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data: FiatResponse) => {
        if (ignore) return;
        setFiatRates({ [baseCurrency]: 1, ...data.rates });
      })
      .catch((error) => {
        if (ignore) return;
        setFiatError(error instanceof Error ? error.message : "Unable to load fiat rates.");
      })
      .finally(() => {
        if (!ignore) setFiatLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [baseCurrency, retryCount]);

  useEffect(() => {
    let ignore = false;
    setCryptoLoading(true);
    setCryptoError(null);

    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd,eur",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Crypto rates request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data: CryptoResponse) => {
        if (ignore) return;
        setCryptoRates(data);
      })
      .catch((error) => {
        if (ignore) return;
        setCryptoError(error instanceof Error ? error.message : "Unable to load crypto rates.");
      })
      .finally(() => {
        if (!ignore) setCryptoLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const amountNumber = Number.parseFloat(amount);
  const hasValidAmount = Number.isFinite(amountNumber) && amountNumber >= 0;

  useEffect(() => {
    if (amount.trim().length === 0) {
      setInputError(null);
      return;
    }
    setInputError(hasValidAmount ? null : "Enter a valid number.");
  }, [amount, hasValidAmount]);

  function convertPriceToUnits(price: number | undefined) {
    if (!price || price <= 0) return null;
    return 1 / price;
  }

  function formatValue(code: ConversionRow["code"], value: number | null) {
    if (value === null || !Number.isFinite(value)) {
      return "Unavailable";
    }

    if (code === "ETH" || code === "BTC" || code === "SOL") {
      const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });
      return `${formatter.format(value)} ${code}`;
    }

    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const symbol = code === "EUR" ? "€" : code === "GBP" ? "£" : "$";
    return `${symbol}${formatter.format(value)}`;
  }

  function sanitizeAmountInput(raw: string) {
    const normalized = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = normalized.split(".");
    if (parts.length <= 1) return normalized;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  async function copyPhrase(text: string, phraseId: string) {
    setCopyError(null);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is not available in this browser.");
      }
      await navigator.clipboard.writeText(text);
      setCopiedPhrase(phraseId);
      setTimeout(() => setCopiedPhrase(null), 1100);
    } catch (error) {
      setCopyError(error instanceof Error ? error.message : "Could not copy this phrase.");
    }
  }

  const conversions = useMemo(() => {
    const baseKey = baseCurrency.toLowerCase() as "usd" | "eur";
    const rates = [
      { code: "USD", label: "US Dollar", rate: baseCurrency === "USD" ? 1 : (fiatRates.USD ?? null) },
      { code: "EUR", label: "Euro", rate: baseCurrency === "EUR" ? 1 : (fiatRates.EUR ?? null) },
      { code: "GBP", label: "British Pound", rate: fiatRates.GBP ?? null },
      { code: "ETH", label: "Ethereum", rate: convertPriceToUnits(cryptoRates.ethereum?.[baseKey]) },
      { code: "BTC", label: "Bitcoin", rate: convertPriceToUnits(cryptoRates.bitcoin?.[baseKey]) },
      { code: "USDC", label: "USD Coin", rate: baseCurrency === "USD" ? 1 : (fiatRates.USD ?? null) },
      { code: "SOL", label: "Solana", rate: convertPriceToUnits(cryptoRates.solana?.[baseKey]) },
    ] satisfies ConversionDefinition[];

    return rates.map((row) => ({
      ...row,
      value:
        hasValidAmount && row.rate !== null && Number.isFinite(row.rate)
          ? amountNumber * row.rate
          : null,
    }));
  }, [amountNumber, baseCurrency, fiatRates, cryptoRates, hasValidAmount]);

  const rateLoadError = fiatError || cryptoError;
  const loadingRates = fiatLoading || cryptoLoading;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Persistent header */}
      <section className="px-4 py-4 border-b border-boston-gray-100 shrink-0">
        <h2 className="text-lg font-black uppercase tracking-wide t-sans-navy">Vivere</h2>
        <p className="text-xs italic t-serif-gray">to live — everything you need to exist in Rome</p>
      </section>

      {/* Sub-tab pill bar */}
      <div className="flex gap-2 px-4 py-3 border-b border-boston-gray-100 overflow-x-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setVivereSubTab(tab.id)}
            className={`shrink-0 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest ${
              vivereSubTab === tab.id
                ? "bg-navy text-white"
                : "border border-boston-gray-100 t-sans-navy"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-6">

        {/* Home */}
        {vivereSubTab === "home" && (
          <div className="px-4 py-4 flex flex-col gap-2">
            {NAV_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setVivereSubTab(card.id)}
                className="bg-white border border-boston-gray-100 rounded-sm px-4 py-3 flex items-center justify-between w-full text-left"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-widest t-sans-navy">{card.title}</p>
                  <p className="text-xs italic t-serif-gray mt-0.5">{card.description}</p>
                </div>
                <span className="text-lg t-sans-gray ml-3">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Currency */}
        {vivereSubTab === "currency" && (
          <div className="px-4 py-4">
            {rateLoadError && (
              <div className="submit-error-box rounded-sm px-3 py-2 mb-3">
                <p className="text-xs t-sans-red">{rateLoadError}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-2 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
                >
                  Retry Rates
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              {(["USD", "EUR"] as const).map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setBaseCurrency(currency)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest ${
                    baseCurrency === currency ? "bg-navy text-white" : "border border-boston-gray-100 t-sans-navy"
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            <input
              className={`submit-input mb-2 ${inputError ? "submit-input-error" : ""}`}
              value={amount}
              onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))}
              placeholder={`Amount in ${baseCurrency}`}
              inputMode="decimal"
              aria-label="Amount to convert"
            />
            {inputError && <p className="text-xs t-sans-red mb-2">{inputError}</p>}

            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
                >
                  {baseCurrency} {preset}
                </button>
              ))}
            </div>

            {loadingRates ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`conv-skeleton-${index}`}
                    className="h-14 animate-pulse rounded-sm border border-boston-gray-100 bg-boston-gray-50"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {conversions.map((row) => (
                  <div
                    key={row.code}
                    className="bg-white border border-boston-gray-100 rounded-sm px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">{row.code}</p>
                      <p className="text-xs t-sans-gray">{row.label}</p>
                    </div>
                    <p className={`text-sm font-black ${row.value === null ? "t-sans-gray" : "t-sans-navy"}`}>
                      {formatValue(row.code, row.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs italic t-serif-gray mt-3">
              {loadingRates
                ? "Loading latest rates..."
                : "Rates refresh daily for fiat; crypto values refresh when this tab loads."}
            </p>
          </div>
        )}

        {/* Phrases */}
        {vivereSubTab === "phrases" && (
          <div className="px-4 py-4">
            {copyError && <p className="text-xs t-sans-red mb-2">{copyError}</p>}
            <div className="flex flex-col gap-2">
              {PHRASES.map((phrase) => {
                const open = expandedPhrase === phrase.id;
                return (
                  <article
                    key={phrase.id}
                    className="bg-white border border-boston-gray-100 rounded-sm p-3"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedPhrase(open ? null : phrase.id)}
                      className="w-full text-left"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest t-sans-blue mb-1">
                        {phrase.category}
                      </p>
                      <p className="text-sm font-black t-sans-navy">{phrase.italian}</p>
                      <p className="text-xs italic t-serif-body mt-1">{phrase.english}</p>
                    </button>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-widest t-sans-gray">
                        {open ? "Tap phrase to hide details" : "Tap phrase for pronunciation"}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyPhrase(phrase.italian, phrase.id)}
                        className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-boston-gray-200 t-sans-navy"
                      >
                        {copiedPhrase === phrase.id ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {open && (
                      <div className="mt-2 border-t border-boston-gray-100 pt-2">
                        <p className="text-xs t-sans-gray">Pronunciation: {phrase.phonetic}</p>
                        <p className="text-xs italic t-serif-body mt-1">{phrase.example}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Getting Around */}
        {vivereSubTab === "around" && (
          <div className="px-4 py-4 flex flex-col gap-2">
            <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Metro</h4>
              <p className="text-xs t-serif-body mt-1">Line B (blue) → <strong>Piramide</strong> is the closest stop to the venue, a 5 min walk. A 100-minute ticket costs €1.50 and works across bus, tram, and metro. Apps: Moovit or Roma Mobilità for live routes.</p>
            </article>
            <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Bus</h4>
              <p className="text-xs t-serif-body mt-1">Lines near the venue: <strong>23, 77, 83, 96, 715, 716, 780</strong>. On foot from Testaccio ~5 min, Garbatella ~15 min, Trastevere ~20 min.</p>
            </article>
            <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Scooters & Bikes</h4>
              <p className="text-xs t-serif-body mt-1">The area is well covered by electric scooters: <strong>Lime, Bird, Dott, eCooltra</strong>. Convenient for short hops between Ostiense and Testaccio.</p>
            </article>
            <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Taxi / Rideshare</h4>
              <p className="text-xs t-serif-body mt-1">Apps: <strong>itTaxi</strong> or <strong>FreeNow</strong>. Avoid unlicensed taxis at tourist spots. Tell the driver: <em>"Industrie Fluviali, Via del Porto Fluviale 35."</em></p>
            </article>
            <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
              <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">From the Airport</h4>
              <p className="text-xs t-serif-body mt-1"><strong>Fiumicino:</strong> Leonardo Express train to Termini (~30 min, €14) or direct to Roma Ostiense (~30 min, €8). <strong>Ciampino:</strong> Shuttle bus to Termini (~40 min, €6), then Metro B to Piramide.</p>
            </article>
          </div>
        )}

        {/* Stay & Hotels */}
        {vivereSubTab === "stay" && (
          <div className="px-4 py-4">
            <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-1">Where to Stay</h3>
            <p className="text-xs italic t-serif-gray mb-3">Neighborhoods near Industrie Fluviali (the FarCon venue)</p>
            <div className="flex flex-col gap-2 mb-6">
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Testaccio & Ostiense</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Local · Authentic · Closest to Venue</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">5–10 min walk</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Raw, local, and full of energy — one of the most authentic areas in Rome. Home to the best traditional Roman food spots, lively nightlife, and Piramide Metro station. The obvious choice if you want to stay close to the action.</p>
              </article>
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">San Saba & Aventino</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Elegant · Quiet · Residential</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">10–15 min walk</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Green, calm, and residential — the Aventine Hill area above Testaccio. Close to the Orange Garden and the famous Knights of Malta keyhole viewpoint.</p>
              </article>
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Colosseum & Celio Hill</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Scenic · Historic · Peaceful</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm border border-boston-gray-200 t-sans-navy text-[10px] font-bold uppercase tracking-widest">~13 min via Metro B</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Metro B Colosseo → Piramide (2 stops, 3 min) + 10 min walk. Close to major landmarks with a quieter, more authentically Roman feel than the center.</p>
              </article>
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Rione Monti</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Creative · Central · Stylish</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm border border-boston-gray-200 t-sans-navy text-[10px] font-bold uppercase tracking-widest">~15 min via Metro B</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Metro B Cavour → Piramide (3 stops, 5 min) + 10 min walk. Independent boutiques, wine bars, and great balance between history and cool vibes. Between the Colosseum and Termini.</p>
              </article>
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Centro Storico</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Iconic · First-Timer Friendly</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm border border-boston-gray-200 t-sans-navy text-[10px] font-bold uppercase tracking-widest">10–20 min by taxi</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Pantheon, Trevi, Spanish Steps. Premium location, unforgettable setting. Best for first-timers who want the classic Rome experience — budget for taxis or scooters to the venue.</p>
              </article>
              <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Esquilino & Piazza Vittorio</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest t-sans-gray mt-0.5">Vibrant · Local · Well Connected</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm border border-boston-gray-200 t-sans-navy text-[10px] font-bold uppercase tracking-widest">~20 min via Metro</span>
                </div>
                <p className="text-xs t-serif-body mt-2">Metro A (Vittorio Emanuele) → Termini → Metro B → Piramide + 10 min walk. Vibrant, international neighbourhood with plenty of restaurants and services at all price points.</p>
              </article>
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-1">Partnered Hotels</h3>
            <p className="text-xs italic t-serif-gray mb-3">Exclusive deals near the venue — discount codes coming soon</p>
            <div className="flex flex-col gap-2">
              <a
                href="https://www.gasometerurbansuites.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-boston-gray-100 rounded-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black t-sans-navy">Gasometer Urban Suites</p>
                  <p className="text-[10px] t-sans-gray mt-0.5">Ostiense — steps from the venue</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">15% off</span>
              </a>
              <a
                href="https://www.h10hotels.com/it/hotel-roma/h10-roma-citta"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-boston-gray-100 rounded-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black t-sans-navy">H10 Roma Città</p>
                  <p className="text-[10px] t-sans-gray mt-0.5">Near Termini station</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">15% off</span>
              </a>
              <a
                href="https://www.crossroadhotel.it/indexita.html"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-boston-gray-100 rounded-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black t-sans-navy">Crossroad Hotel</p>
                  <p className="text-[10px] t-sans-gray mt-0.5">Central location</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">10% off</span>
              </a>
              <a
                href="https://www.booking.com/hotel/it/b-amp-b-city-lights-rome.it.html"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-boston-gray-100 rounded-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black t-sans-navy">City Lights Rome</p>
                  <p className="text-[10px] t-sans-gray mt-0.5">B&B near the center</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-sm bg-navy text-white text-[10px] font-bold uppercase tracking-widest">15% off</span>
              </a>
              <a
                href="https://www.abitarthotel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-boston-gray-100 rounded-sm p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black t-sans-navy">Abitart Hotel</p>
                  <p className="text-[10px] t-sans-gray mt-0.5">Ostiense — boutique design hotel</p>
                </div>
                <span className="shrink-0 px-2 py-0.5 rounded-sm border border-boston-gray-200 t-sans-navy text-[10px] font-bold uppercase tracking-widest">TBC</span>
              </a>
            </div>
            <p className="text-xs italic t-serif-gray mt-3">Discount codes and booking instructions coming soon. Join the FarCon Telegram for updates.</p>
          </div>
        )}

      </div>
    </div>
  );
}
