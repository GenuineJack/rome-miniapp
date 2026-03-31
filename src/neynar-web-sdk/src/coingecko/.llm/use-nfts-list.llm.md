# useNFTsList

**Type**: hook

Fetches a paginated list of NFT collections with filtering and sorting options

This hook provides a comprehensive list of NFT collections with basic metadata,
ideal for building NFT marketplace interfaces, collection browsers, and search
functionality. Supports filtering by blockchain network and custom sorting.

## Import

```typescript
import { useNFTsList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useNFTsList(
  params?: NFTListParams,
  options?: ExtendedQueryOptions<NFTListItem[]> & CoinGeckoHookOptions,
): QueryHookResult<NFTListItem[]>;
```

## Parameters

### params

- **Type**: `NFTListParams`
- **Required**: No
- **Description**: - Optional filtering and pagination parameters

### options

- **Type**: `ExtendedQueryOptions<NFTListItem[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Configuration options for query behavior and data fetching

## Returns

```typescript
QueryHookResult<NFTListItem[]>;
```

TanStack Query result with array of NFT collection summaries

## Usage

```typescript
import { useNFTsList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useNFTsList(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const {
  data: nftsList,
  isLoading,
  error,
} = useNFTsList(
  {
    order: "h24_volume_usd_desc", // Sort by 24h volume descending
    asset_platform_id: "ethereum", // Only Ethereum NFTs
    per_page: 50,
    page: 1,
  },
  {
    staleTime: 3600000, // 1 hour cache
    refetchOnWindowFocus: false,
  },
);

// Build NFT collection grid:
nftsList?.forEach((collection, index) => {
  console.log(`#${index + 1}: ${collection.name}`);
  console.log(`Symbol: ${collection.symbol || "N/A"}`);
  console.log(`Thumbnail: ${collection.thumb}`);
});

// Filter collections by name:
const searchTerm = "ape";
const filteredCollections = nftsList?.filter((collection) =>
  collection.name.toLowerCase().includes(searchTerm.toLowerCase()),
);
```
