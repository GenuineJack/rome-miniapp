# useExchangeVolumeChartRange

**Type**: hook

Get historical trading volume chart data for a specific exchange within a custom date range

This hook fetches time-series volume data for a specific time period defined by
Unix timestamps, allowing for precise historical analysis and custom chart ranges.
Perfect for detailed analysis and comparison tools.

## Import

```typescript
import { useExchangeVolumeChartRange } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchangeVolumeChartRange(
  exchangeId: string,
  from: number,
  to: number,
  options?: ExtendedQueryOptions<ExchangeVolumeChart> & CoinGeckoHookOptions,
): UseQueryResult<ExchangeVolumeChart, ApiError>;
```

## Parameters

### exchangeId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the exchange (e.g., 'binance', 'coinbase_exchange')

### from

- **Type**: `number`
- **Required**: Yes
- **Description**: - Start Unix timestamp for the data range

### to

- **Type**: `number`
- **Required**: Yes
- **Description**: - End Unix timestamp for the data range

### options

- **Type**: `ExtendedQueryOptions<ExchangeVolumeChart> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<ExchangeVolumeChart, ApiError>;
```

TanStack Query result containing array of [timestamp, volume] pairs for the specified range

## Usage

```typescript
import { useExchangeVolumeChartRange } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchangeVolumeChartRange("example", 123, 123);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function CustomRangeVolumeChart({ exchangeId }: { exchangeId: string }) {
  const startDate = new Date('2024-01-01').getTime() / 1000;
  const endDate = new Date('2024-01-31').getTime() / 1000;

  const { data, isLoading, error } = useExchangeVolumeChartRange(
    exchangeId,
    startDate,
    endDate,
    { staleTime: 30 * 60 * 1000 } // 30 minutes for historical data
  );

  if (isLoading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const chartData = data?.map(([timestamp, volume]) => ({
    date: new Date(timestamp * 1000),
    volume: parseFloat(volume)
  })) || [];

  return (
    <div>
      <h3>January 2024 Volume Data</h3>
      <LineChart data={chartData} />
    </div>
  );
}
```
