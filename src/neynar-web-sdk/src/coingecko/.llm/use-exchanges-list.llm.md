# useExchangesList

**Type**: hook

Get simplified list of all exchange IDs and names for dropdowns and selection

This hook provides a lightweight endpoint for fetching basic exchange information,
optimized for use in form dropdowns, autocomplete components, and selection lists.
Data is cached for 24 hours due to its static nature.

## Import

```typescript
import { useExchangesList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useExchangesList(
  options?: ExtendedQueryOptions<ExchangeListItem[]> & CoinGeckoHookOptions,
): UseQueryResult<ExchangeListItem[], ApiError>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<ExchangeListItem[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<ExchangeListItem[], ApiError>;
```

TanStack Query result containing array of basic exchange info with id and name only

## Usage

```typescript
import { useExchangesList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useExchangesList([]);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function ExchangeSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const { data, isLoading } = useExchangesList({
    staleTime: 24 * 60 * 60 * 1000 // Cache for 24 hours
  });

  if (isLoading) return <div>Loading exchanges...</div>;

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select an exchange</option>
      {data?.map((exchange) => (
        <option key={exchange.id} value={exchange.id}>
          {exchange.name}
        </option>
      ))}
    </select>
  );
}
```
