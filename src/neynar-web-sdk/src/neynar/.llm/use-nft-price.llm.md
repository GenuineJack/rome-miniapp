# useNftPrice

**Type**: hook

Fetches the mint price for a collection via `GET /api/nft/price`.

Designed to work with `createNftPriceHandler` from `@/neynar-web-sdk/nextjs`. Returns the total cost in ETH including Neynar fees and estimated gas. Free collections return `{ cost_eth: 0 }`.

## Import

```typescript
import { useNftPrice } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNftPrice(
  params: NftPriceRequest,
  options?: QueryHookOptions<NftPriceResponse>,
): QueryHookResult<NftPriceResponse>;
```

## Parameters

### params

- **Type**: `NftPriceRequest`
- **Required**: Yes

### options

- **Type**: `QueryHookOptions`
- **Required**: No
- **Description**: TanStack Query options (enabled, staleTime, etc.)

## Request Type

```typescript
type NftPriceRequest = {
  collectionSlug: string;
  quantity?: number; // default: 1
  fid: number;
};
```

## Response Type

```typescript
type NftPriceResponse = {
  cost_eth: number;
};
```

## Examples

```tsx
import { useNftPrice } from "@/neynar-web-sdk/neynar";

function MintCost({
  fid,
  collectionSlug,
}: {
  fid: number;
  collectionSlug: string;
}) {
  const { data: price, isLoading } = useNftPrice({
    fid,
    collectionSlug,
    quantity: 1,
  });

  if (isLoading) return <p>Loading price...</p>;
  if (!price) return null;

  return <p>Cost: {price.cost_eth.toFixed(4)} ETH</p>;
}
```
