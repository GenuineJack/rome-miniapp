# useExchangeVolumeChart

**Type**: hook

Get historical trading volume chart data for a specific cryptocurrency exchange

This hook fetches time-series volume data for creating charts and analyzing
exchange trading activity patterns over specified time periods. Essential
for market analysis dashboards and exchange comparison tools.

## Import

```typescript
import { useExchangeVolumeChart } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchangeVolumeChart(
  exchangeId: string,
  days: number,
  options?: ExtendedQueryOptions<ExchangeVolumeChart> & CoinGeckoHookOptions,
): UseQueryResult<ExchangeVolumeChart, ApiError>;
```

## Parameters

### exchangeId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the exchange (e.g., 'binance', 'coinbase_exchange')

### days

- **Type**: `number`
- **Required**: Yes
- **Description**: - Number of days of historical data to fetch (1, 7, 14, 30, 90, 180, 365)

### options

- **Type**: `ExtendedQueryOptions<ExchangeVolumeChart> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<ExchangeVolumeChart, ApiError>;
```

TanStack Query result containing array of [timestamp, volume] pairs for charting

## Usage

```typescript
import { useExchangeVolumeChart } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchangeVolumeChart("example", 123);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function ExchangeVolumeChart({ exchangeId }: { exchangeId: string }) {
  const { data, isLoading, error } = useExchangeVolumeChart(
    exchangeId,
    30, // Last 30 days
    { staleTime: 10 * 60 * 1000 }
  );

  if (isLoading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const chartData = data?.map(([timestamp, volume]) => ({
    date: new Date(timestamp),
    volume: parseFloat(volume)
  })) || [];

  // Render with your preferred chart library
  return <LineChart data={chartData} />;
}
```
