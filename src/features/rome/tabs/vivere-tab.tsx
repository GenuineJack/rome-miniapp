"use client";

import { useEffect, useMemo, useState } from "react";

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

export function VivereTab() {
  const [baseCurrency, setBaseCurrency] = useState<"USD" | "EUR">("USD");
  const [amount, setAmount] = useState("100");
  const [fiatRates, setFiatRates] = useState<Record<string, number>>({});
  const [cryptoRates, setCryptoRates] = useState<CryptoResponse>({});
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://api.frankfurter.app/latest?base=${baseCurrency}`)
      .then((response) => response.json())
      .then((data: FiatResponse) => setFiatRates({ [baseCurrency]: 1, ...data.rates }))
      .catch(() => setFiatRates({ [baseCurrency]: 1 }));
  }, [baseCurrency]);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd,eur",
    )
      .then((response) => response.json())
      .then((data: CryptoResponse) => setCryptoRates(data))
      .catch(() => setCryptoRates({}));
  }, []);

  const amountNumber = Number(amount || 0);

  const conversions = useMemo(() => {
    const rates = [
      { code: "USD", label: "US Dollar", rate: fiatRates.USD ?? (baseCurrency === "USD" ? 1 : 0) },
      { code: "EUR", label: "Euro", rate: fiatRates.EUR ?? (baseCurrency === "EUR" ? 1 : 0) },
      { code: "GBP", label: "British Pound", rate: fiatRates.GBP ?? 0 },
      { code: "ETH", label: "Ethereum", rate: 1 / ((cryptoRates.ethereum?.[baseCurrency.toLowerCase() as "usd" | "eur"] ?? 0) || Number.POSITIVE_INFINITY) },
      { code: "BTC", label: "Bitcoin", rate: 1 / ((cryptoRates.bitcoin?.[baseCurrency.toLowerCase() as "usd" | "eur"] ?? 0) || Number.POSITIVE_INFINITY) },
      { code: "USDC", label: "USD Coin", rate: baseCurrency === "USD" ? 1 : (fiatRates.USD ?? 0) },
      { code: "SOL", label: "Solana", rate: 1 / ((cryptoRates.solana?.[baseCurrency.toLowerCase() as "usd" | "eur"] ?? 0) || Number.POSITIVE_INFINITY) },
    ];

    return rates.map((row) => ({
      ...row,
      value: Number.isFinite(row.rate) ? amountNumber * row.rate : 0,
    }));
  }, [amountNumber, baseCurrency, fiatRates, cryptoRates]);

  return (
    <div className="h-full overflow-y-auto pb-6">
      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h2 className="text-lg font-black uppercase tracking-wide t-sans-navy">Vivere</h2>
        <p className="text-xs italic t-serif-gray">to live — everything you need to exist in Rome</p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Currency Converter</h3>
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
          className="submit-input mb-3"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder={`Amount in ${baseCurrency}`}
          inputMode="decimal"
        />

        <div className="flex flex-col gap-2">
          {conversions.map((row) => (
            <div key={row.code} className="bg-white border border-boston-gray-100 rounded-sm px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest t-sans-blue">{row.code}</p>
                <p className="text-xs t-sans-gray">{row.label}</p>
              </div>
              <p className="text-sm font-black t-sans-navy">{row.value.toFixed(4)}</p>
            </div>
          ))}
        </div>

        <p className="text-xs italic t-serif-gray mt-3">Rates update daily. Crypto prices update on load.</p>
      </section>

      <section className="px-4 py-4 border-b border-boston-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Italian Phrases</h3>
        <div className="flex flex-col gap-2">
          {PHRASES.map((phrase) => {
            const open = expandedPhrase === phrase.id;
            return (
              <button
                key={phrase.id}
                type="button"
                onClick={async () => {
                  setExpandedPhrase(open ? null : phrase.id);
                  await navigator.clipboard.writeText(phrase.italian);
                  setCopiedPhrase(phrase.id);
                  setTimeout(() => setCopiedPhrase(null), 1000);
                }}
                className="text-left bg-white border border-boston-gray-100 rounded-sm p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest t-sans-blue mb-1">{phrase.category}</p>
                <p className="text-sm font-black t-sans-navy">{phrase.italian}</p>
                <p className="text-xs italic t-serif-body mt-1">{phrase.english}</p>
                <p className="text-[11px] uppercase tracking-widest t-sans-gray mt-2">
                  {copiedPhrase === phrase.id ? "Copied" : "Tap to copy"}
                </p>
                {open && (
                  <div className="mt-2 border-t border-boston-gray-100 pt-2">
                    <p className="text-xs t-sans-gray">Pronunciation: {phrase.phonetic}</p>
                    <p className="text-xs italic t-serif-body mt-1">{phrase.example}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-4">
        <h3 className="text-sm font-black uppercase tracking-widest t-sans-navy mb-3">Getting Around Rome</h3>
        <div className="flex flex-col gap-2">
          <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
            <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Metro</h4>
            <p className="text-xs t-serif-body mt-1">Line B is closest to the venue area. Piramide or Garbatella are both about a 10-15 minute walk to INDUSTRIE FLUVIALI.</p>
          </article>
          <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
            <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Bus</h4>
            <p className="text-xs t-serif-body mt-1">Multiple lines serve Via del Porto Fluviale. For live routes, check Moovit or Google Maps.</p>
          </article>
          <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
            <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Taxi / Rideshare</h4>
            <p className="text-xs t-serif-body mt-1">itTaxi and FREE NOW are the common options. Uber exists but usually costs more. Ask for the tassametro in official taxis.</p>
          </article>
          <article className="bg-white border border-boston-gray-100 rounded-sm p-3">
            <h4 className="text-xs font-black uppercase tracking-widest t-sans-blue">Walking</h4>
            <p className="text-xs t-serif-body mt-1">The venue is around 25 minutes from Trastevere and around 15 minutes from Ostiense station by foot.</p>
          </article>
        </div>
      </section>

      {/* TODO: Integrate transit.land feed f-sr-atac~romatpl~trenitalia~rt */}
      {/* API details: https://www.transit.land/feeds/f-sr-atac~romatpl~trenitalia~rt */}
    </div>
  );
}
