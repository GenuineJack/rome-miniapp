# createNftPriceHandler

**Type**: function

Creates a GET handler for the NFT price route.

Returns `{ cost_eth: number }` for the given collection and quantity. Free collections return `{ cost_eth: 0 }`. Uses `estimateNftMintCost` internally to compute accurate costs including Neynar fees and gas.

## API Surface

```typescript
import { createNftPriceHandler } from "@/neynar-web-sdk/nextjs";

export function createNftPriceHandler(options: CreateNftPriceHandlerOptions): {
  GET: (request: Request) => Promise<Response>;
};
```

## Parameters

### options

- **Type**: `CreateNftPriceHandlerOptions`
- **Required**: Yes

#### options.config

- **Type**: `Pick<NftHandlerConfig, "apiKey" | "network" | "contractAddress"> | ((ctx: NftCallbackContext) => ...)`
- **Required**: Yes
- **Description**: Static config or resolver function. Only needs `apiKey`, `network`, and `contractAddress` (no `walletId` needed).

#### options.rpcUrl

- **Type**: `RpcUrlMap` (`Partial<Record<'base' | 'optimism' | 'base-sepolia', string>>`)
- **Required**: Yes
- **Description**: Map of chain names to RPC endpoint URLs, used for gas estimation.

#### options.pricingTier

- **Type**: `(ctx: NftCallbackContext) => "free" | "fee-only" | "paid" | null`
- **Required**: No
- **Description**: Returns the pricing tier for a collection. `"free"` or `null` → returns `{ cost_eth: 0 }`. Defaults to `"paid"` if not provided.

## Returns

- **Type**: `{ GET: (request: Request) => Promise<Response> }`
- **Description**: Next.js route handler. Place at `app/api/nft/price/route.ts`.

### Query Parameters

- `collectionSlug` (required) — Collection identifier
- `fid` (required) — User's Farcaster ID
- `quantity` (optional, default: 1) — Number of tokens

### Response Body

```typescript
{
  cost_eth: number;
}
```

## Examples

```typescript
import { createNftPriceHandler } from "@/neynar-web-sdk/nextjs";
import { privateConfig } from "@/config/private-config";
import { getCollection } from "@/config/nft-config";

export const { GET } = createNftPriceHandler({
  config: ({ collectionSlug }) => {
    const c = getCollection(collectionSlug);
    return {
      apiKey: privateConfig.neynarApiKey,
      network: c.network,
      contractAddress: c.contractAddress,
    };
  },
  rpcUrl: { base: process.env.BASE_RPC_URL! },
  pricingTier: ({ collectionSlug }) => {
    const c = getCollection(collectionSlug);
    return c.pricingTier;
  },
});
```
