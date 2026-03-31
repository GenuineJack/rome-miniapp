# useCoinsList

**Type**: hook

Get comprehensive list of all supported coins

Fetches the complete list of coins supported by CoinGecko API. This endpoint provides
the basic coin information including ID, symbol, and name that can be used for other
API calls. Cached for 24 hours as the coin list is relatively stable.

## Import

```typescript
import { useCoinsList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinsList(
  params?: { include_platform?: boolean },
  options?: ExtendedQueryOptions<
    Array<{ id: string; symbol: string; name: string }>
  > &
    CoinGeckoHookOptions,
): UseQueryResult<
  Array<{ id: string; symbol: string; name: string }>,
  ApiError
>;
```

## Parameters

### params

- **Type**: `{ include_platform?: boolean }`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `include_platform?: boolean` - - Whether to include platform contract addresses

### options

- **Type**: `ExtendedQueryOptions<
  Array<{ id: string; symbol: string; name: string }>
  > &
  > CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult<Array<{ id: string; symbol: string; name: string }>, ApiError>;
```

TanStack Query result containing coins list, loading state, and error info

## Usage

```typescript
import { useCoinsList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinsList({ include_platform: true });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic coins list

```typescript
function CoinsList() {
const { data: coins, isLoading, error } = useCoinsList();

if (isLoading) return <div>Loading coins...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!coins?.length) return <div>No coins found</div>;

return (
<div>
<h2>All Coins ({coins.length})</h2>
{coins.map(coin => (
<div key={coin.id}>
 <strong>{coin.name}</strong> ({coin.symbol.toUpperCase()})
 <small>ID: {coin.id}</small>
</div>
))}
</div>
);
}
```

### Example 2

With platform information for contract addresses

```typescript
function CoinsWithContracts() {
const { data: coins } = useCoinsList({ include_platform: true });

return (
<div>
{coins?.map(coin => (
<div key={coin.id}>
 <h3>{coin.name}</h3>
 {coin.platforms && (
   <div>
     <h4>Contract Addresses:</h4>
     {Object.entries(coin.platforms).map(([platform, address]) => (
       <p key={platform}>{platform}: {address}</p>
     ))}
   </div>
 )}
</div>
))}
</div>
);
}
```
