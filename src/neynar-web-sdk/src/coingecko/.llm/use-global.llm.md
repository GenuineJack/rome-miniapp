# useGlobal

**Type**: hook

Get global cryptocurrency market data

Fetches comprehensive global cryptocurrency market statistics from CoinGecko.
This includes total market capitalization, trading volumes, number of active
cryptocurrencies, ICO statistics, and market dominance percentages across
different currencies. Data is cached for 5 minutes for optimal performance.

## Import

```typescript
import { useGlobal } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useGlobal(
  options?: ExtendedQueryOptions<GlobalData> & CoinGeckoHookOptions,
): UseQueryResult<GlobalData, ApiError>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<GlobalData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<GlobalData, ApiError>;
```

TanStack Query result containing global market data, loading state, and error info

## Usage

```typescript
import { useGlobal } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useGlobal(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic global market data

```tsx
function GlobalMarketOverview() {
  const { data: global, isLoading, error } = useGlobal();

  if (isLoading) return <div>Loading global market data...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!global?.data) return <div>No global data available</div>;

  const { data } = global;
  const totalMarketCapUSD = data.total_market_cap?.usd;
  const btcDominance = data.market_cap_percentage?.btc;

  return (
    <div>
      <h2>Global Cryptocurrency Market</h2>
      <div>Total Market Cap: ${totalMarketCapUSD?.toLocaleString()}</div>
      <div>Bitcoin Dominance: {btcDominance?.toFixed(2)}%</div>
      <div>Active Cryptocurrencies: {data.active_cryptocurrencies}</div>
      <div>Total Markets: {data.markets}</div>
      <div>24h Volume: ${data.total_volume?.usd?.toLocaleString()}</div>
      <div>
        24h Change: {data.market_cap_change_percentage_24h_usd?.toFixed(2)}%
      </div>
    </div>
  );
}
```

### Example 2

With custom query options

```tsx
function CachedGlobalData() {
  const { data } = useGlobal({
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
    enabled: true, // Always fetch when component mounts
  });

  return <div>Market Cap: ${data?.data?.total_market_cap?.usd}</div>;
}
```
