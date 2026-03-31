# useExchangeRates

**Type**: hook

Get Bitcoin exchange rates against multiple fiat and cryptocurrency currencies

This hook fetches real-time BTC exchange rates from CoinGecko API, providing
conversion rates for financial calculations, price displays, and multi-currency support.
The data includes both fiat currencies (USD, EUR, JPY) and cryptocurrencies (ETH, LTC).

## Import

```typescript
import { useExchangeRates } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchangeRates(
  options?: ExtendedQueryOptions<ExchangeRatesResponse> & CoinGeckoHookOptions,
): UseQueryResult<ExchangeRatesResponse, ApiError>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<ExchangeRatesResponse> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<ExchangeRatesResponse, ApiError>;
```

TanStack Query result containing BTC exchange rates with currency metadata

## Usage

```typescript
import { useExchangeRates } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchangeRates(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
function CurrencyConverter() {
  const { data, isLoading, error } = useExchangeRates({
    staleTime: 60 * 1000, // 1 minute cache
    refetchInterval: 30 * 1000 // Auto-refresh every 30 seconds
  });

  if (isLoading) return <div>Loading exchange rates...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const rates = data?.data?.rates;
  if (!rates) return <div>No rates available</div>;

  return (
    <div>
      <h2>Bitcoin Exchange Rates</h2>
      <div>
        <h3>Fiat Currencies</h3>
        {Object.entries(rates)
          .filter(([_, rate]) => rate.type === 'fiat')
          .map(([currency, rate]) => (
            <div key={currency}>
              <strong>{rate.name} ({currency.toUpperCase()})</strong>:
              {rate.value.toLocaleString()} {rate.unit}
            </div>
          ))}
      </div>
      <div>
        <h3>Cryptocurrencies</h3>
        {Object.entries(rates)
          .filter(([_, rate]) => rate.type === 'crypto')
          .map(([currency, rate]) => (
            <div key={currency}>
              <strong>{rate.name} ({currency.toUpperCase()})</strong>:
              {rate.value} {rate.unit}
            </div>
          ))}
      </div>
    </div>
  );
}
```

### Example 2

```typescript
// Using exchange rates for price conversion
function BTCPriceConverter({ btcAmount }: { btcAmount: number }) {
  const { data } = useExchangeRates({
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const rates = data?.data?.rates;
  if (!rates) return <div>Loading rates...</div>;

  const usdRate = rates.usd?.value || 0;
  const eurRate = rates.eur?.value || 0;

  return (
    <div>
      <p>{btcAmount} BTC = ${(btcAmount * usdRate).toLocaleString()}</p>
      <p>{btcAmount} BTC = €{(btcAmount * eurRate).toLocaleString()}</p>
    </div>
  );
}
```
