# useGlobalMarketCapChart

**Type**: hook

Get global market capitalization historical chart data

Fetches time series data for global cryptocurrency market capitalization and trading volume.
Returns arrays of timestamp-value pairs that can be used to create charts showing
market trends over time. Data is available for various time periods and can be
denominated in different base currencies.

## Import

```typescript
import { useGlobalMarketCapChart } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useGlobalMarketCapChart(
  params?: GlobalMarketCapChartParams,
  options?: ExtendedQueryOptions<MarketCapChartData> & CoinGeckoHookOptions,
): UseQueryResult<MarketCapChartData, ApiError>;
```

## Parameters

### params

- **Type**: `GlobalMarketCapChartParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `days?: DaysParam` - Number of days of data to fetch
- `vs_currency?: string` - Base currency for chart data (default: 'usd')

### options

- **Type**: `ExtendedQueryOptions<MarketCapChartData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<MarketCapChartData, ApiError>;
```

TanStack Query result containing chart data, loading state, and error info

## Usage

```typescript
import { useGlobalMarketCapChart } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useGlobalMarketCapChart({ days: /* value */, vs_currency: "example" });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic market cap chart data

```tsx
function GlobalMarketCapChart() {
  const { data: chartData, isLoading } = useGlobalMarketCapChart({
    days: "30",
    vs_currency: "usd",
  });

  if (isLoading) return <div>Loading chart data...</div>;

  const marketCap = chartData?.market_cap_chart?.market_cap;
  const volume = chartData?.market_cap_chart?.volume;

  return (
    <div>
      <h3>30-Day Market Cap Trend</h3>
      <div>Data points: {marketCap?.length}</div>
      <div>
        Latest market cap: $
        {marketCap?.[marketCap.length - 1]?.[1]?.toLocaleString()}
      </div>
      <div>
        Latest volume: ${volume?.[volume.length - 1]?.[1]?.toLocaleString()}
      </div>
    </div>
  );
}
```

### Example 2

Chart with different time periods

```tsx
function MarketCapChartSelector() {
  const [timeframe, setTimeframe] = useState<DaysParam>("7");
  const { data } = useGlobalMarketCapChart({ days: timeframe });

  return (
    <div>
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value as DaysParam)}
      >
        <option value="1">1 Day</option>
        <option value="7">7 Days</option>
        <option value="30">30 Days</option>
        <option value="90">90 Days</option>
        <option value="365">1 Year</option>
        <option value="max">All Time</option>
      </select>
      {data?.market_cap_chart && (
        <ChartComponent data={data.market_cap_chart} />
      )}
    </div>
  );
}
```

### Example 3

Processing chart data for visualization

```tsx
function useProcessedChartData(days: DaysParam = "7") {
  const { data, ...queryResult } = useGlobalMarketCapChart({ days });

  const processedData = useMemo(() => {
    if (!data?.market_cap_chart) return null;

    return {
      labels: data.market_cap_chart.market_cap?.map(([timestamp]) =>
        new Date(timestamp).toLocaleDateString(),
      ),
      marketCap: data.market_cap_chart.market_cap?.map(([, value]) => value),
      volume: data.market_cap_chart.volume?.map(([, value]) => value),
    };
  }, [data]);

  return { processedData, ...queryResult };
}
```
