# useCoinMarketChartRange

**Type**: hook

Get historical market data for a custom date range

Fetches historical price, market cap, and volume data between specific timestamps.
Useful for analyzing performance during specific time periods or events.
Data granularity automatically adjusts based on the range duration. Historical
data is cached for 5 minutes as it's relatively stable.

## Import

```typescript
import { useCoinMarketChartRange } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinMarketChartRange(
  id: string,
  vsCurrency: string,
  from: number,
  to: number,
  options?: ExtendedQueryOptions<MarketChartData> & CoinGeckoHookOptions,
): UseQueryResult<MarketChartData, ApiError>;
```

## Parameters

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: - The CoinGecko ID of the coin (e.g., 'bitcoin', 'ethereum')

### vsCurrency

- **Type**: `string`
- **Required**: Yes
- **Description**: - Target currency for price data (e.g., 'usd', 'eur', 'btc')

### from

- **Type**: `number`
- **Required**: Yes
- **Description**: - Start timestamp in Unix format (seconds since epoch)

### to

- **Type**: `number`
- **Required**: Yes
- **Description**: - End timestamp in Unix format (seconds since epoch)

### options

- **Type**: `ExtendedQueryOptions<MarketChartData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<MarketChartData, ApiError>;
```

TanStack Query result containing chart data for the specified range

## Usage

```typescript
import { useCoinMarketChartRange } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinMarketChartRange("example", "example", 123, 123);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Custom date range analysis

```typescript
function EventAnalysis({ coinId }: { coinId: string }) {
// Analyze price during a specific event (e.g., Bitcoin halving)
const halvingDate = new Date('2024-04-20').getTime() / 1000;
const beforeHalving = halvingDate - (30 * 24 * 60 * 60); // 30 days before
const afterHalving = halvingDate + (30 * 24 * 60 * 60);  // 30 days after

const { data: chartData, isLoading } = useCoinMarketChartRange(
coinId,
'usd',
beforeHalving,
afterHalving
);

if (isLoading) return <div>Loading event analysis...</div>;
if (!chartData) return <div>No data available for this period</div>;

const beforePrice = chartData.prices.find(([timestamp]) =>
timestamp <= halvingDate * 1000
)?.[1];
const afterPrice = chartData.prices[chartData.prices.length - 1]?.[1];
const change = beforePrice && afterPrice ?
((afterPrice - beforePrice) / beforePrice * 100) : 0;

return (
<div>
<h2>Halving Event Analysis</h2>
<div className="metrics">
<p>Price before: ${beforePrice?.toFixed(2)}</p>
<p>Price after: ${afterPrice?.toFixed(2)}</p>
<p>Change: {change.toFixed(2)}%</p>
</div>
</div>
);
}
```

### Example 2

Portfolio performance tracking

```typescript
function PortfolioTracker({ coinId, purchaseDate }: {
coinId: string;
purchaseDate: Date;
}) {
const purchaseTimestamp = purchaseDate.getTime() / 1000;
const currentTimestamp = Date.now() / 1000;

const { data: performanceData } = useCoinMarketChartRange(
coinId,
'usd',
purchaseTimestamp,
currentTimestamp
);

if (!performanceData) return <div>Loading performance...</div>;

const purchasePrice = performanceData.prices[0]?.[1];
const currentPrice = performanceData.prices[performanceData.prices.length - 1]?.[1];
const totalReturn = purchasePrice && currentPrice ?
((currentPrice - purchasePrice) / purchasePrice * 100) : 0;

return (
<div className="portfolio-tracker">
<h2>Investment Performance</h2>
<div className="performance-metrics">
<p>Purchase Price: ${purchasePrice?.toFixed(2)}</p>
<p>Current Price: ${currentPrice?.toFixed(2)}</p>
<p>Total Return: {totalReturn.toFixed(2)}%</p>
</div>
</div>
);
}
```
