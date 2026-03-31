# useSimplePrice

**Type**: hook

Fetches current price data for multiple cryptocurrencies across multiple currencies

This is the most efficient hook for getting real-time price information without
the overhead of comprehensive market data. Ideal for price tickers, portfolio displays,
and applications requiring frequent price updates with minimal data transfer.

The hook automatically handles comma-separated ID formatting and provides intelligent
caching with 30-second stale time to balance data freshness with API efficiency.

## Import

```typescript
import { useSimplePrice } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useSimplePrice(
  ids: string[],
  vsCurrencies: string[],
  options?: SimplePriceOptions,
  queryOptions?: ExtendedQueryOptions<SimplePriceData> & CoinGeckoHookOptions,
): UseQueryResult<SimplePriceData, ApiError>;
```

## Parameters

### ids

- **Type**: `string[]`
- **Required**: Yes
- **Description**: - Array of coin IDs to fetch prices for (e.g., ['bitcoin', 'ethereum', 'cardano'])

### vsCurrencies

- **Type**: `string[]`
- **Required**: Yes
- **Description**: - Array of target currencies for price conversion (e.g., ['usd', 'eur', 'btc'])

### options

- **Type**: `SimplePriceOptions`
- **Required**: No
- **Description**: Additional query parameters

**options properties:**

- `includeMarketCap?: boolean` - - Include market capitalization for each coin
- `include24hrVol?: boolean` - - Include 24-hour trading volume data
- `include24hrChange?: boolean` - - Include 24-hour percentage change data
- `includeLastUpdatedAt?: boolean` - - Include timestamp of last price update
- `precision?: string` - - Control decimal precision of returned prices

### queryOptions

- **Type**: `ExtendedQueryOptions<SimplePriceData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<SimplePriceData, ApiError>;
```

TanStack Query result with price data in nested object structure

## Usage

```typescript
import { useSimplePrice } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useSimplePrice("example", "example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
// Basic price fetching for major cryptocurrencies
const {
  data: prices,
  isLoading,
  error,
} = useSimplePrice(
  ["bitcoin", "ethereum", "cardano"],
  ["usd", "eur", "btc"],
  {
    includeMarketCap: true,
    include24hrChange: true,
    precision: "2",
  },
  {
    refetchInterval: 30000, // Refetch every 30 seconds for live prices
    staleTime: 15000, // Consider data stale after 15 seconds
  },
);

// Access specific price data:
const bitcoinPriceUsd = prices?.bitcoin?.usd;
const ethereumPriceEur = prices?.ethereum?.eur;
const cardanoPriceBtc = prices?.cardano?.btc;

// Handle market cap and change data:
const bitcoinMarketCap = prices?.bitcoin?.usd_market_cap;
const ethereumChange24h = prices?.ethereum?.usd_24h_change;
```

### Example 2

```typescript
// Portfolio tracking with multiple currencies
const portfolioCoins = ["bitcoin", "ethereum", "solana", "cardano"];
const displayCurrencies = ["usd", "eur", "gbp"];

const { data: portfolioPrices } = useSimplePrice(
  portfolioCoins,
  displayCurrencies,
  {
    includeMarketCap: true,
    include24hrChange: true,
  },
);

// Calculate portfolio value:
const calculatePortfolioValue = (holdings: Record<string, number>) => {
  return portfolioCoins.reduce((total, coin) => {
    const price = portfolioPrices?.[coin]?.usd || 0;
    const amount = holdings[coin] || 0;
    return total + price * amount;
  }, 0);
};
```
