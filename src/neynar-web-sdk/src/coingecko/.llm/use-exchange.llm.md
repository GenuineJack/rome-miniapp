# useExchange

**Type**: hook

Get comprehensive details for a specific cryptocurrency exchange

This hook fetches complete exchange information including basic details,
social media links, trust metrics, trading volume data, and operational status.

## Import

```typescript
import { useExchange } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchange(
  exchangeId: string,
  options?: ExtendedQueryOptions<Exchange> & CoinGeckoHookOptions,
): UseQueryResult<Exchange, ApiError>;
```

## Parameters

### exchangeId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the exchange (e.g., 'binance', 'coinbase_exchange')

### options

- **Type**: `ExtendedQueryOptions<Exchange> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<Exchange, ApiError>;
```

TanStack Query result containing detailed exchange information

## Usage

```typescript
import { useExchange } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchange("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function ExchangeProfile({ exchangeId }: { exchangeId: string }) {
  const { data, isLoading, error } = useExchange(exchangeId, {
    enabled: !!exchangeId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  if (isLoading) return <div>Loading exchange details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Exchange not found</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <img src={data.image} alt={data.name} />
      <p>Trust Score: {data.trust_score}/10</p>
      <p>Established: {data.year_established}</p>
      <p>Country: {data.country}</p>
      <p>24h Volume: {data.trade_volume_24h_btc} BTC</p>
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        Visit Exchange
      </a>
    </div>
  );
}
```
