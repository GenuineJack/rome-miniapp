# useGlobalDefi

**Type**: hook

Get global DeFi-focused market data

Fetches the same global cryptocurrency data as useGlobal but with a separate
cache key optimized for DeFi-specific use cases. This allows different components
to cache and refresh DeFi-related global metrics independently from general
global market data, providing better cache granularity for DeFi applications.

Uses the same CoinGecko /global endpoint but maintains separate query cache
for scenarios where DeFi components need different refresh intervals or
cache invalidation strategies than general market overview components.

## Import

```typescript
import { useGlobalDefi } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useGlobalDefi(
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
import { useGlobalDefi } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useGlobalDefi(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

DeFi-specific global metrics

```tsx
function DeFiGlobalMetrics() {
  const { data: globalData, isLoading } = useGlobalDefi();

  if (isLoading) return <div>Loading DeFi global metrics...</div>;
  if (!globalData?.data) return <div>No DeFi data available</div>;

  const { data } = globalData;
  const totalVolume = data.total_volume?.usd;
  const ethDominance = data.market_cap_percentage?.eth;

  return (
    <div>
      <h3>DeFi Global Metrics</h3>
      <div>Total Volume: ${totalVolume?.toLocaleString()}</div>
      <div>Ethereum Dominance: {ethDominance?.toFixed(2)}%</div>
      <div>Active Cryptocurrencies: {data.active_cryptocurrencies}</div>
      <div>
        Market Cap Change:{" "}
        {data.market_cap_change_percentage_24h_usd?.toFixed(2)}%
      </div>
    </div>
  );
}
```

### Example 2

Independent caching for DeFi dashboards

```tsx
function DeFiDashboard() {
  // DeFi components use useGlobalDefi with longer cache time
  const { data: defiGlobal } = useGlobalDefi({
    staleTime: 10 * 60 * 1000, // 10 minutes for DeFi metrics
    refetchOnWindowFocus: false,
  });

  // General market components use useGlobal with shorter cache time
  const { data: generalGlobal } = useGlobal({
    staleTime: 2 * 60 * 1000, // 2 minutes for general market
  });

  return (
    <div>
      <DeFiMetrics data={defiGlobal} />
      <GeneralMarket data={generalGlobal} />
    </div>
  );
}
```

### Example 3

Filtering DeFi-relevant metrics

```tsx
function useDeFiMetrics() {
  const { data, ...queryResult } = useGlobalDefi();

  const defiMetrics = useMemo(() => {
    if (!data?.data) return null;

    const { total_market_cap, market_cap_percentage, total_volume } = data.data;

    return {
      totalMarketCap: total_market_cap?.usd,
      totalVolume: total_volume?.usd,
      ethDominance: market_cap_percentage?.eth,
      adaDominance: market_cap_percentage?.ada,
      dotDominance: market_cap_percentage?.dot,
      // Focus on DeFi-relevant tokens
    };
  }, [data]);

  return { defiMetrics, ...queryResult };
}
```
