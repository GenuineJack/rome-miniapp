# useAssetPlatforms

**Type**: hook

Fetches comprehensive list of all supported blockchain asset platforms

This hook provides information about blockchain networks and platforms supported
by CoinGecko, including chain identifiers, native coins, and platform metadata.
Essential for building multi-chain applications and understanding supported networks.

The asset platform data includes Ethereum, Binance Smart Chain, Polygon, Avalanche,
and many other blockchain networks with their respective chain IDs and native tokens.

## Import

```typescript
import { useAssetPlatforms } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useAssetPlatforms(
  params?: AssetPlatformsParams,
  options?: ExtendedQueryOptions<AssetPlatform[]> & AssetPlatformsHookOptions,
): QueryHookResult<AssetPlatform[]>;
```

## Parameters

### params

- **Type**: `AssetPlatformsParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `filter?: string` - - Filter platforms by name or identifier (case-insensitive)

### options

- **Type**: `ExtendedQueryOptions<AssetPlatform[]> & AssetPlatformsHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<AssetPlatform[]>;
```

TanStack Query result with array of supported blockchain platforms

## Usage

```typescript
import { useAssetPlatforms } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useAssetPlatforms({ filter: "example" });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
// Get all supported blockchain platforms
const {
  data: platforms,
  isLoading,
  error,
} = useAssetPlatforms(undefined, {
  staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (stable data)
  refetchOnWindowFocus: false,
});

// Display supported networks:
platforms?.forEach((platform) => {
  console.log(`${platform.name} (${platform.id})`);
  if (platform.chain_identifier) {
    console.log(`Chain ID: ${platform.chain_identifier}`);
  }
  if (platform.native_coin_id) {
    console.log(`Native Token: ${platform.native_coin_id}`);
  }
});
```

### Example 2

```typescript
// Filter platforms by name
const { data: ethereumPlatforms } = useAssetPlatforms(
  { filter: "ethereum" },
  {
    staleTime: 24 * 60 * 60 * 1000,
    enabled: true,
  },
);

// Use for wallet integration:
const supportedChains = ethereumPlatforms
  ?.filter((platform) => platform.chain_identifier)
  ?.map((platform) => ({
    chainId: platform.chain_identifier!,
    name: platform.name,
    nativeCurrency: platform.native_coin_id,
    rpcUrls: [], // Add your RPC URLs
  }));
```

### Example 3

```typescript
// Check if specific blockchain is supported
const { data: platforms } = useAssetPlatforms();

const isPolygonSupported = platforms?.some(
  (platform) => platform.id === "polygon-pos",
);

const polygonChainId = platforms?.find(
  (platform) => platform.id === "polygon-pos",
)?.chain_identifier; // Should be 137
```
