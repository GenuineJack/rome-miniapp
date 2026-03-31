# useExchangeTickers

**Type**: hook

Get trading pairs and ticker data for a specific cryptocurrency exchange

This hook fetches real-time ticker information for all trading pairs on an exchange,
including prices, volumes, spreads, and trust scores for each market. Essential
for building trading interfaces and market analysis tools.

## Import

```typescript
import { useExchangeTickers } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchangeTickers(
  exchangeId: string,
  params?: ExchangeTickersParams,
  options?: ExtendedQueryOptions<ExchangeTickersResponse> &
    CoinGeckoHookOptions,
): UseQueryResult<ExchangeTickersResponse, ApiError>;
```

## Parameters

### exchangeId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the exchange (e.g., 'binance', 'coinbase_exchange')

### params

- **Type**: `ExchangeTickersParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `coin_ids?: string` - - Comma-separated list of coin IDs to filter tickers (e.g., 'bitcoin,ethereum')
- `include_exchange_logo?: boolean` - - Whether to include exchange logo URLs in response
- `page?: number` - - Page number for pagination (1-indexed)
- `depth?: boolean` - - Whether to include order book depth information
- `order?: "trust_score_desc" | "trust_score_asc" | "volume_desc"` - - Sort order for tickers: trust_score_desc, trust_score_asc, or volume_desc

### options

- **Type**: `ExtendedQueryOptions<ExchangeTickersResponse> &
CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<ExchangeTickersResponse, ApiError>;
```

TanStack Query result containing exchange name and array of ticker objects with pricing data

## Usage

```typescript
import { useExchangeTickers } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchangeTickers("example", { coin_ids: "example", include_exchange_logo: true });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function ExchangeTickers({ exchangeId }: { exchangeId: string }) {
  const { data, isLoading, error } = useExchangeTickers(
    exchangeId,
    {
      coin_ids: 'bitcoin,ethereum',
      order: 'volume_desc',
      page: 1
    },
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );

  if (isLoading) return <div>Loading tickers...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{data?.name} Trading Pairs</h2>
      {data?.tickers.map((ticker) => (
        <div key={`${ticker.base}-${ticker.target}`}>
          <h3>{ticker.base}/{ticker.target}</h3>
          <p>Last Price: ${ticker.converted_last.usd}</p>
          <p>24h Volume: ${ticker.converted_volume.usd}</p>
          <p>Trust Score: {ticker.trust_score}</p>
          <p>Spread: {ticker.bid_ask_spread_percentage}%</p>
        </div>
      ))}
    </div>
  );
}
```
