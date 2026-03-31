# useDerivatives

**Type**: hook

Get comprehensive derivatives market overview with ticker data

This hook fetches the complete derivatives market landscape including open interest,
trading volumes, and individual ticker information across all supported exchanges.
Essential for derivatives market analysis and portfolio tracking.

## Import

```typescript
import { useDerivatives } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useDerivatives(
  params?: {
    /** Include ticker data: 'all', 'unexpired', or omit to exclude tickers */
    include_tickers?: "all" | "unexpired" | string;
  },
  options?: ExtendedQueryOptions<DerivativesOverview> & CoinGeckoHookOptions,
): QueryHookResult<DerivativesOverview>;
```

## Parameters

### params

- **Type**: `{
  /** Include ticker data: 'all', 'unexpired', or omit to exclude tickers */
  include_tickers?: "all" | "unexpired" | string;
}`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `include_tickers?: "all" | "unexpired" | string` - - Whether to include individual ticker data: 'all', 'unexpired', or exclude

### options

- **Type**: `ExtendedQueryOptions<DerivativesOverview> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<DerivativesOverview>;
```

TanStack Query result containing derivatives market overview with tickers and volume data

## Usage

```typescript
import { useDerivatives } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useDerivatives({ include_tickers: "example" });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function DerivativesMarketOverview() {
  const { data, isLoading, error } = useDerivatives(
    { include_tickers: 'unexpired' },
    { staleTime: 2 * 60 * 1000 }
  );

  if (isLoading) return <div>Loading derivatives data...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.data) return <div>No derivatives data available</div>;

  const overview = data.data;
  return (
    <div>
      <h2>Derivatives Market Overview</h2>
      <p>Total Open Interest: ${overview.total_open_interest_usd.toLocaleString()}</p>
      <p>24h Volume: ${overview.total_volume_24h_usd.toLocaleString()}</p>
      <div>
        <h3>Active Contracts ({overview.data.length})</h3>
        {overview.data.map((ticker, index) => (
          <div key={index}>
            <strong>{ticker.symbol}</strong> on {ticker.market}
            <p>Price: ${ticker.last.toLocaleString()}</p>
            <p>Open Interest: ${ticker.open_interest_usd.toLocaleString()}</p>
            <p>Funding Rate: {(ticker.funding_rate * 100).toFixed(4)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```
