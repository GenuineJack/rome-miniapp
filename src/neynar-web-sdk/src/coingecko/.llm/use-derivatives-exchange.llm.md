# useDerivativesExchange

**Type**: hook

Get comprehensive details for a specific derivatives exchange

This hook fetches complete information about a derivatives exchange including
all available trading pairs, ticker data, open interest, and exchange metrics.
Ideal for detailed exchange analysis and trading pair discovery.

## Import

```typescript
import { useDerivativesExchange } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useDerivativesExchange(
  exchangeId: string,
  params?: {
    /** Include ticker data: 'all', 'unexpired', or omit to exclude tickers */
    include_tickers?: "all" | "unexpired" | string;
  },
  options?: ExtendedQueryOptions<DerivativesExchangeDetails> &
    CoinGeckoHookOptions,
): QueryHookResult<DerivativesExchangeDetails>;
```

## Parameters

### exchangeId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the derivatives exchange (e.g., 'bybit', 'binance_futures')

### params

- **Type**: `{
  /** Include ticker data: 'all', 'unexpired', or omit to exclude tickers */
  include_tickers?: "all" | "unexpired" | string;
}`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `include_tickers?: "all" | "unexpired" | string` - - Whether to include trading pair ticker data: 'all', 'unexpired'

### options

- **Type**: `ExtendedQueryOptions<DerivativesExchangeDetails> &
CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<DerivativesExchangeDetails>;
```

TanStack Query result containing detailed exchange information with trading pairs

## Usage

```typescript
import { useDerivativesExchange } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useDerivativesExchange("example", { include_tickers: "example" });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function DerivativesExchangeDetails({ exchangeId }: { exchangeId: string }) {
  const { data, isLoading, error } = useDerivativesExchange(
    exchangeId,
    { include_tickers: 'unexpired' },
    {
      enabled: !!exchangeId,
      staleTime: 5 * 60 * 1000
    }
  );

  if (isLoading) return <div>Loading exchange details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Exchange not found</div>;

  return (
    <div>
      <h1>{data.name} Derivatives</h1>
      <div>
        <img src={data.image} alt={data.name} width={64} height={64} />
        <p>{data.description}</p>
        <p>Total Open Interest: {data.open_interest_btc} BTC</p>
        <p>24h Volume: {data.trade_volume_24h_btc} BTC</p>
        <p>Trading Pairs: {data.tickers.length}</p>
      </div>

      <div>
        <h3>Active Trading Pairs</h3>
        {data.tickers.map((ticker, index) => (
          <div key={index}>
            <h4>{ticker.symbol} ({ticker.contract_type})</h4>
            <p>Price: ${ticker.last.toLocaleString()}</p>
            <p>24h Change: {ticker.price_change_percentage_24h?.toFixed(2)}%</p>
            <p>Volume: ${ticker.volume.toLocaleString()}</p>
            <p>Open Interest: ${ticker.open_interest_usd.toLocaleString()}</p>
            <p>Funding Rate: {(ticker.funding_rate * 100).toFixed(4)}%</p>
            {ticker.expired_at && (
              <p>Expires: {new Date(ticker.expired_at).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```
