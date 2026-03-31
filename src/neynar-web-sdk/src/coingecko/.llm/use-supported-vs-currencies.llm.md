# useSupportedVsCurrencies

**Type**: hook

Fetches the complete list of supported currencies for CoinGecko price queries

Returns all available target currencies that can be used in vs_currencies parameters
for price conversion. This includes fiat currencies (USD, EUR, GBP), major cryptocurrencies
(BTC, ETH), and various commodities and other assets supported by CoinGecko.

The data is cached for 24 hours as the list of supported currencies rarely changes,
making this an efficient way to validate currency inputs and build currency selectors.

## Import

```typescript
import { useSupportedVsCurrencies } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useSupportedVsCurrencies(
  options?: ExtendedQueryOptions<string[]> & CoinGeckoHookOptions,
): UseQueryResult<string[], ApiError>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<string[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<string[], ApiError>;
```

TanStack Query result with array of supported currency symbols

## Usage

```typescript
import { useSupportedVsCurrencies } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useSupportedVsCurrencies("example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
// Get all supported currencies for validation
const { data: currencies, isLoading } = useSupportedVsCurrencies({
  staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
});

// Use for input validation:
const validateCurrency = (currency: string) => {
  return currencies?.includes(currency.toLowerCase()) ?? false;
};

// Filter to major currencies for UI:
const majorCurrencies = currencies?.filter((currency) =>
  ["usd", "eur", "gbp", "jpy", "btc", "eth"].includes(currency),
);
```

### Example 2

```typescript
// Build currency selector component
const { data: allCurrencies } = useSupportedVsCurrencies();

const CurrencySelector = ({ onChange, value }: CurrencySelectorProps) => {
  // Group currencies by type
  const fiatCurrencies = allCurrencies?.filter(c =>
    ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud'].includes(c)
  );
  const cryptoCurrencies = allCurrencies?.filter(c =>
    ['btc', 'eth', 'bnb', 'ada', 'sol', 'dot'].includes(c)
  );

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <optgroup label="Fiat Currencies">
        {fiatCurrencies?.map(currency => (
          <option key={currency} value={currency}>
            {currency.toUpperCase()}
          </option>
        ))}
      </optgroup>
      <optgroup label="Cryptocurrencies">
        {cryptoCurrencies?.map(currency => (
          <option key={currency} value={currency}>
            {currency.toUpperCase()}
          </option>
        ))}
      </optgroup>
    </select>
  );
};
```
