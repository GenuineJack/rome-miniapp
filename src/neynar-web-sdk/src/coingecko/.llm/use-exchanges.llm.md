# useExchanges

**Type**: hook

Get list of all supported cryptocurrency exchanges with comprehensive market data

This hook fetches exchanges from CoinGecko API with trust scores, trading volumes,
establishment information, and ranking data for market analysis and comparison.

## Import

```typescript
import { useExchanges } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchanges(
  params?: ExchangesListParams,
  options?: ExtendedQueryOptions<Exchange[]> & CoinGeckoHookOptions,
): UseQueryResult<Exchange[], ApiError>;
```

## Parameters

### params

- **Type**: `ExchangesListParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `per_page?: number` - - Number of exchanges to return per page (default varies by API)
- `page?: number` - - Page number for pagination (1-indexed)

### options

- **Type**: `ExtendedQueryOptions<Exchange[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<Exchange[], ApiError>;
```

TanStack Query result containing array of exchange objects with trust scores and volume data

## Usage

```typescript
import { useExchanges } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchanges({ per_page: 123, page: 123 });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function ExchangesList() {
  const { data, isLoading, error } = useExchanges(
    { per_page: 50, page: 1 },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) return <div>Loading exchanges...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((exchange) => (
        <div key={exchange.id}>
          <h3>{exchange.name}</h3>
          <p>Trust Score: {exchange.trust_score}/10</p>
          <p>24h Volume: {exchange.trade_volume_24h_btc} BTC</p>
          <p>Country: {exchange.country}</p>
        </div>
      ))}
    </div>
  );
}
```
