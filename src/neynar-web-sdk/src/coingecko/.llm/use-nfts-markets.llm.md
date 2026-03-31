# useNFTsMarkets

**Type**: hook

Fetches comprehensive NFT market data with trading metrics and performance indicators

This hook provides detailed market information for NFT collections including
floor prices, trading volumes, market caps, and percentage changes. Essential
for building NFT trading interfaces, market analysis tools, and portfolio dashboards.

## Import

```typescript
import { useNFTsMarkets } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useNFTsMarkets(
  params?: NFTMarketsParams,
  options?: ExtendedQueryOptions<NFTMarket[]> & CoinGeckoHookOptions,
): QueryHookResult<NFTMarket[]>;
```

## Parameters

### params

- **Type**: `NFTMarketsParams`
- **Required**: No
- **Description**: - Optional filtering and pagination parameters for market data

### options

- **Type**: `ExtendedQueryOptions<NFTMarket[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Configuration options for query behavior and real-time updates

## Returns

```typescript
QueryHookResult<NFTMarket[]>;
```

TanStack Query result with array of NFT market data including trading metrics

## Usage

```typescript
import { useNFTsMarkets } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useNFTsMarkets(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const {
  data: markets,
  isLoading,
  error,
} = useNFTsMarkets(
  {
    asset_platform_id: "ethereum",
    order: "h24_volume_usd_desc", // Sort by 24h volume
    per_page: 25,
    page: 1,
  },
  {
    staleTime: 120000, // 2 minutes
    refetchInterval: 300000, // Auto-refresh every 5 minutes
    refetchOnWindowFocus: true, // Refresh on window focus
  },
);

// Display top performing NFT markets:
markets?.forEach((market, index) => {
  console.log(`#${index + 1}: ${market.name}`);
  console.log(`Floor Price: $${market.floor_price_in_usd}`);
  console.log(`24h Volume: $${market.h24_volume_in_usd}`);
  console.log(`Market Cap: $${market.market_cap_in_usd}`);
  console.log(
    `24h Change: ${market.floor_price_in_usd_24h_percentage_change}%`,
  );
});

// Find trending collections (positive price movement):
const trendingCollections = markets
  ?.filter((market) => market.floor_price_in_usd_24h_percentage_change > 10)
  .slice(0, 5);

// Calculate average metrics:
const avgFloorPrice =
  markets?.reduce((sum, market) => sum + (market.floor_price_in_usd || 0), 0) /
  (markets?.length || 1);
```
