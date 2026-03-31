# useCoin

**Type**: hook

Get comprehensive information for a specific coin

Fetches detailed coin information including description, links, market data,
community statistics, developer metrics, and more. This is the primary endpoint
for getting complete coin details. Data is cached for 5 minutes to balance
freshness with performance.

## Import

```typescript
import { useCoin } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoin(
  id: string,
  params?: {
    localization?: boolean;
    tickers?: boolean;
    market_data?: boolean;
    community_data?: boolean;
    developer_data?: boolean;
    sparkline?: boolean;
  },
  options?: ExtendedQueryOptions<CoinDetails> & CoinGeckoHookOptions,
): UseQueryResult<CoinDetails, ApiError>;
```

## Parameters

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: - The CoinGecko ID of the coin (e.g., 'bitcoin', 'ethereum')

### params

- **Type**: `{
  localization?: boolean;
  tickers?: boolean;
  market_data?: boolean;
  community_data?: boolean;
  developer_data?: boolean;
  sparkline?: boolean;
}`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `localization?: boolean` - - Include localized descriptions (default: true)
- `tickers?: boolean` - - Include ticker data from exchanges (default: true)
- `market_data?: boolean` - - Include market data like prices and volumes (default: true)
- `community_data?: boolean` - - Include community statistics (default: true)
- `developer_data?: boolean` - - Include developer activity metrics (default: true)
- `sparkline?: boolean` - - Include 7-day sparkline data (default: false)

### options

- **Type**: `ExtendedQueryOptions<CoinDetails> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<CoinDetails, ApiError>;
```

TanStack Query result containing detailed coin data, loading state, and error info

## Usage

```typescript
import { useCoin } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoin("example", { localization: true, tickers: true });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic coin information display

```typescript
function CoinDetail({ coinId }: { coinId: string }) {
const { data: coin, isLoading, error } = useCoin(coinId);

if (isLoading) return <div>Loading {coinId}...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!coin) return <div>Coin not found</div>;

return (
<div>
<div className="coin-header">
<img src={coin.image?.large} alt={coin.name} width={64} />
<div>
 <h1>{coin.name} ({coin.symbol?.toUpperCase()})</h1>
 <p>Rank: #{coin.market_cap_rank}</p>
</div>
</div>

<div className="coin-stats">
<h2>Market Data</h2>
<p>Current Price: ${coin.market_data?.current_price?.usd}</p>
<p>Market Cap: ${coin.market_data?.market_cap?.usd?.toLocaleString()}</p>
<p>24h Volume: ${coin.market_data?.total_volume?.usd?.toLocaleString()}</p>
<p>24h Change: {coin.market_data?.price_change_percentage_24h?.toFixed(2)}%</p>
</div>
</div>
);
}
```

### Example 2

Minimal data for performance optimization

```typescript
function QuickCoinInfo({ coinId }: { coinId: string }) {
const { data: coin } = useCoin(coinId, {
localization: false,
tickers: false,
community_data: false,
developer_data: false
});

if (!coin) return null;

return (
<div>
<h2>{coin.name}</h2>
<p>Price: ${coin.market_data?.current_price?.usd}</p>
<p>Market Cap Rank: #{coin.market_cap_rank}</p>
</div>
);
}
```
