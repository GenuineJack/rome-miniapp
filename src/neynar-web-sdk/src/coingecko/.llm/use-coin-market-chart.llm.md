# useCoinMarketChart

**Type**: hook

Get historical market chart data for a coin

Fetches historical price, market cap, and volume data for charting and analysis.
Returns time series data in arrays of [timestamp, value] pairs. Data granularity
automatically adjusts based on the requested time period. Cached for 1 minute
due to the real-time nature of market data.

## Import

```typescript
import { useCoinMarketChart } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinMarketChart(
  id: string,
  params: ChartParams,
  options?: ExtendedQueryOptions<MarketChartData> & CoinGeckoHookOptions,
): UseQueryResult<MarketChartData, ApiError>;
```

## Parameters

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: - The CoinGecko ID of the coin (e.g., 'bitcoin', 'ethereum')

### params

- **Type**: `ChartParams`
- **Required**: Yes
- **Description**: - Chart data parameters including currency, timeframe, and precision

### options

- **Type**: `ExtendedQueryOptions<MarketChartData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<MarketChartData, ApiError>;
```

TanStack Query result containing chart data, loading state, and error info

## Usage

```typescript
import { useCoinMarketChart } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinMarketChart("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic price chart data fetching

```typescript
function CoinChart({ coinId }: { coinId: string }) {
const { data: chartData, isLoading } = useCoinMarketChart(coinId, {
vs_currency: 'usd',
days: '30'
});

if (isLoading) return <div>Loading chart...</div>;
if (!chartData) return <div>No chart data available</div>;

return (
<div>
<h2>Price Chart (30 Days)</h2>
<div className="chart-stats">
<p>Data points: {chartData.prices.length}</p>
<p>Latest price: ${chartData.prices[chartData.prices.length - 1]?.[1]}</p>
</div>
</div>
);
}
```

### Example 2

Multi-metric dashboard data

```typescript
function CoinDashboard({ coinId }: { coinId: string }) {
const { data: chartData } = useCoinMarketChart(coinId, {
vs_currency: 'usd',
days: '7',
interval: 'hourly'
});

if (!chartData) return <div>Loading dashboard...</div>;

const latestPrice = chartData.prices[chartData.prices.length - 1]?.[1];
const latestVolume = chartData.total_volumes[chartData.total_volumes.length - 1]?.[1];
const latestMarketCap = chartData.market_caps[chartData.market_caps.length - 1]?.[1];

return (
<div className="dashboard">
<div className="metrics">
<div>Current Price: ${latestPrice?.toFixed(2)}</div>
<div>24h Volume: ${latestVolume?.toLocaleString()}</div>
<div>Market Cap: ${latestMarketCap?.toLocaleString()}</div>
</div>
</div>
);
}
```
