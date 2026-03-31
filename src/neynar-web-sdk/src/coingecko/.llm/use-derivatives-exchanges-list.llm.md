# useDerivativesExchangesList

**Type**: hook

Get simplified list of all derivatives exchange IDs and names for dropdowns and selection

This hook provides a lightweight endpoint for fetching basic derivatives exchange information,
optimized for use in form dropdowns, autocomplete components, and selection lists.
Contains only essential data for UI components without heavy trading metrics.

## Import

```typescript
import { useDerivativesExchangesList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useDerivativesExchangesList(
  options?: ExtendedQueryOptions<DerivativesExchangeListItem[]> &
    CoinGeckoHookOptions,
): QueryHookResult<DerivativesExchangeListItem[]>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<DerivativesExchangeListItem[]> &
CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<DerivativesExchangeListItem[]>;
```

TanStack Query result containing array of basic exchange info with id and name only

## Usage

```typescript
import { useDerivativesExchangesList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useDerivativesExchangesList([]);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function DerivativesExchangeSelector({
  onSelect
}: {
  onSelect: (exchangeId: string, exchangeName: string) => void
}) {
  const { data, isLoading } = useDerivativesExchangesList({
    staleTime: 24 * 60 * 60 * 1000 // Cache for 24 hours
  });

  if (isLoading) return <div>Loading exchanges...</div>;

  return (
    <select
      onChange={(e) => {
        const selectedExchange = data?.find(ex => ex.id === e.target.value);
        if (selectedExchange) {
          onSelect(selectedExchange.id, selectedExchange.name);
        }
      }}
    >
      <option value="">Select a derivatives exchange</option>
      {data?.map((exchange) => (
        <option key={exchange.id} value={exchange.id}>
          {exchange.name}
        </option>
      ))}
    </select>
  );
}

// Usage in a trading interface
function TradingDashboard() {
  const [selectedExchange, setSelectedExchange] = useState<string>('');

  const handleExchangeSelect = (id: string, name: string) => {
    setSelectedExchange(id);
    // Load trading pairs for selected exchange
  };

  return (
    <div>
      <DerivativesExchangeSelector onSelect={handleExchangeSelect} />
      {selectedExchange && (
        <DerivativesExchangeDetails exchangeId={selectedExchange} />
      )}
    </div>
  );
}
```
