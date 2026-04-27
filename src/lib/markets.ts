import yahooFinance from "yahoo-finance2";

export type MarketSnapshot = {
  nasdaq: string;
  dow: string;
  sp500: string;
  btc: string;
  eth: string;
  sol: string;
};

export async function fetchMarketData(): Promise<MarketSnapshot | null> {
  const symbols = ["^IXIC", "^DJI", "^GSPC", "BTC-USD", "ETH-USD", "SOL-USD"];

  try {
    const quotes = await Promise.all(
      symbols.map((s) => yahooFinance.quote(s)),
    );

    const fmt = (q: {
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
    }) => {
      const change = q.regularMarketChangePercent ?? 0;
      const dir = change >= 0 ? "▲" : "▼";
      return `${q.regularMarketPrice?.toLocaleString()} ${dir} ${Math.abs(change).toFixed(2)}%`;
    };

    return {
      nasdaq: fmt(quotes[0]),
      dow: fmt(quotes[1]),
      sp500: fmt(quotes[2]),
      btc: fmt(quotes[3]),
      eth: fmt(quotes[4]),
      sol: fmt(quotes[5]),
    };
  } catch (err) {
    console.error("Market data fetch failed:", err);
    return null;
  }
}

export function isWeekend(date: Date): boolean {
  const day = date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
  });
  return day === "Sat" || day === "Sun";
}
