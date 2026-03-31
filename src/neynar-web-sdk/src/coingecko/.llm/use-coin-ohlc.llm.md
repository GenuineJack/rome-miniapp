# useCoinOHLC

**Type**: hook

Get OHLC (Open, High, Low, Close) candlestick data for a coin

Fetches Open, High, Low, Close price data suitable for candlestick charts and
technical analysis. Each data point represents aggregated price action for the
specified time period. Data granularity depends on the requested days parameter.
Cached for 5 minutes to balance freshness with performance.

Data granularity by period:

- 1 day: 30-minute intervals
- 7-30 days: 4-hour intervals
- 31-90 days: 12-hour intervals
- 91+ days: 1-day intervals

## Import

```typescript
import { useCoinOHLC } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinOHLC(
  id: string,
  vsCurrency: string,
  days: number,
  options?: ExtendedQueryOptions<OHLCData[]> & CoinGeckoHookOptions,
): UseQueryResult<OHLCData[], ApiError>;
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

### days

- **Type**: `number`
- **Required**: Yes
- **Description**: - Number of days of OHLC data (1, 7, 14, 30, 90, 180, 365)

### options

- **Type**: `ExtendedQueryOptions<OHLCData[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<OHLCData[], ApiError>;
```

TanStack Query result containing OHLC data array, loading state, and error info

## Usage

```typescript
import { useCoinOHLC } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinOHLC("example", "example", 123);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Candlestick chart component

```typescript
function CandlestickChart({ coinId }: { coinId: string }) {
const { data: ohlcData, isLoading } = useCoinOHLC(coinId, 'usd', 30);

if (isLoading) return <div>Loading OHLC data...</div>;
if (!ohlcData?.length) return <div>No OHLC data available</div>;

// Transform OHLC data for charting library
const candlestickData = ohlcData.map(([timestamp, open, high, low, close]) => ({
x: new Date(timestamp),
y: [open, high, low, close]
}));

return (
<div>
<h2>30-Day Candlestick Chart</h2>
<div className="ohlc-summary">
<h3>Latest OHLC</h3>
{ohlcData[ohlcData.length - 1] && (
 <div className="ohlc-values">
   <p>Open: ${ohlcData[ohlcData.length - 1][1]?.toFixed(2)}</p>
   <p>High: ${ohlcData[ohlcData.length - 1][2]?.toFixed(2)}</p>
   <p>Low: ${ohlcData[ohlcData.length - 1][3]?.toFixed(2)}</p>
   <p>Close: ${ohlcData[ohlcData.length - 1][4]?.toFixed(2)}</p>
 </div>
)}
</div>
</div>
);
}
```

### Example 2

Technical analysis with OHLC data

```typescript
function TechnicalAnalysis({ coinId }: { coinId: string }) {
const { data: weeklyOHLC } = useCoinOHLC(coinId, 'usd', 7);
const { data: monthlyOHLC } = useCoinOHLC(coinId, 'usd', 30);

const calculateVolatility = (ohlcData: OHLCData[]) => {
if (!ohlcData?.length) return 0;
const dailyRanges = ohlcData.map(([, , high, low]) =>
((high - low) / low * 100)
);
return dailyRanges.reduce((sum, range) => sum + range, 0) / dailyRanges.length;
};

const weeklyVolatility = calculateVolatility(weeklyOHLC || []);
const monthlyVolatility = calculateVolatility(monthlyOHLC || []);

return (
<div className="technical-analysis">
<h2>Technical Analysis Dashboard</h2>
<div className="volatility-metrics">
<div>7-Day Avg Volatility: {weeklyVolatility.toFixed(2)}%</div>
<div>30-Day Avg Volatility: {monthlyVolatility.toFixed(2)}%</div>
</div>
</div>
);
}
```
