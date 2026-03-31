# useDerivativesExchanges

**Type**: hook

Get paginated list of derivatives exchanges with trading metrics

This hook fetches a comprehensive directory of cryptocurrency derivatives exchanges
including trading volumes, open interest, and the number of trading pairs available.
Perfect for exchange comparison and market analysis.

## Import

```typescript
import { useDerivativesExchanges } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useDerivativesExchanges(
  params?: {
    /** Sort order for exchanges list */
    order?:
      | "open_interest_btc_desc"
      | "open_interest_btc_asc"
      | "name_desc"
      | "name_asc"
      | string;
    /** Number of exchanges per page (1-250) */
    per_page?: number;
    /** Page number (1-indexed) */
    page?: number;
  },
  options?: ExtendedQueryOptions<DerivativesExchange[]> & CoinGeckoHookOptions,
): QueryHookResult<DerivativesExchange[]>;
```

## Parameters

### params

- **Type**: `{
  /** Sort order for exchanges list */
  order?:
    | "open_interest_btc_desc"
    | "open_interest_btc_asc"
    | "name_desc"
    | "name_asc"
    | string;
  /** Number of exchanges per page (1-250) */
  per_page?: number;
  /** Page number (1-indexed) */
  page?: number;
}`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `order?: | "open_interest_btc_desc"
| "open_interest_btc_asc"
| "name_desc"
| "name_asc"
| string` - - Sort order: 'open_interest_btc_desc', 'open_interest_btc_asc', 'name_desc', 'name_asc'
- `per_page?: number` - - Number of exchanges to return per page (1-250, default 100)
- `page?: number` - - Page number for pagination (1-indexed, default 1)

### options

- **Type**: `ExtendedQueryOptions<DerivativesExchange[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<DerivativesExchange[]>;
```

TanStack Query result containing array of derivatives exchanges with trading metrics

## Usage

```typescript
import { useDerivativesExchanges } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useDerivativesExchanges({ order: "example", per_page: 123 });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function DerivativesExchangesList() {
  const { data, isLoading, error } = useDerivativesExchanges(
    {
      order: 'open_interest_btc_desc',
      per_page: 20,
      page: 1
    },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) return <div>Loading exchanges...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Top Derivatives Exchanges</h2>
      {data?.map((exchange, index) => (
        <div key={exchange.id}>
          <h3>#{index + 1} {exchange.name}</h3>
          <img src={exchange.image} alt={exchange.name} width={32} height={32} />
          <p>Open Interest: {exchange.open_interest_btc} BTC</p>
          <p>24h Volume: {exchange.trade_volume_24h_btc} BTC</p>
          <p>Perpetual Pairs: {exchange.number_of_perpetual_pairs}</p>
          <p>Futures Pairs: {exchange.number_of_futures_pairs}</p>
          <p>Established: {exchange.year_established || 'Unknown'}</p>
          <p>Country: {exchange.country || 'Global'}</p>
          <a href={exchange.url} target="_blank" rel="noopener noreferrer">
            Visit Exchange →
          </a>
        </div>
      ))}
    </div>
  );
}
```
