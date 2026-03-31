# useNFT

**Type**: hook

Fetches comprehensive data for a specific NFT collection

This hook provides detailed information about an individual NFT collection including
floor prices, trading volumes, market caps, collection statistics, and metadata.
Perfect for NFT collection pages, portfolio tracking, and market analysis.

## Import

```typescript
import { useNFT } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useNFT(
  id: string,
  options?: ExtendedQueryOptions<NFTCollection> & CoinGeckoHookOptions,
): QueryHookResult<NFTCollection>;
```

## Parameters

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: - The NFT collection's unique identifier (e.g., 'cryptopunks', 'bored-ape-yacht-club')

### options

- **Type**: `ExtendedQueryOptions<NFTCollection> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Configuration options for query behavior and data fetching

## Returns

```typescript
QueryHookResult<NFTCollection>;
```

TanStack Query result with comprehensive NFT collection data

## Usage

```typescript
import { useNFT } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useNFT("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const {
  data: collection,
  isLoading,
  error,
} = useNFT("cryptopunks", {
  staleTime: 300000, // 5 minutes
  refetchOnWindowFocus: false,
});

// Access NFT collection information:
console.log(`${collection?.name} Collection`);
console.log(`Floor Price: ${collection?.floor_price?.usd} USD`);
console.log(`Total Supply: ${collection?.total_supply} items`);
console.log(`24h Volume: ${collection?.volume_24h?.usd} USD`);
console.log(`Market Cap: ${collection?.market_cap?.usd} USD`);

// Track price changes:
const floorPriceChange = collection?.floor_price_24h_percentage_change;
const isIncreasing = floorPriceChange && floorPriceChange > 0;
```
