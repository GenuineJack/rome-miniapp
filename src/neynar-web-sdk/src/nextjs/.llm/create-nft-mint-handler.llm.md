# createNftMintHandler

**Type**: function

Creates a POST handler for the NFT mint route.

Handles the full mint lifecycle: mint token(s) on-chain, generate unique images per token (or use pre-generated preview), upload metadata. Supports both mystery mint and preview-first patterns via the optional `previewStorage` config. When `quantity > 1`, images are generated in parallel with a concurrency cap.

**Note**: Preview-first pattern (`previewStorage`) only supports `quantity: 1`. Returns 400 if `quantity > 1` with `previewStorage` configured. Eject to standalone utilities for multi-token preview flows.

## API Surface

```typescript
import { createNftMintHandler } from "@/neynar-web-sdk/nextjs";

export function createNftMintHandler(options: CreateNftMintHandlerOptions): {
  POST: (request: Request) => Promise<Response>;
};
```

## Parameters

### options

- **Type**: `CreateNftMintHandlerOptions`
- **Required**: Yes

#### options.config

- **Type**: `NftHandlerConfig | ((ctx: NftCallbackContext) => NftHandlerConfig)` — `{ apiKey, walletId, network, contractAddress }`
- **Required**: Yes
- **Description**: Static config object or a resolver function that receives the request context (including `collectionSlug`). Use a function for multi-collection apps.

#### options.imagePrompt

- **Type**: `(ctx: NftCallbackContext & { tokenId?: string }) => string | Promise<string>`
- **Required**: Yes
- **Description**: AI prompt for image generation. `tokenId` is available after minting (mystery mint). `collectionSlug` is available via `ctx`.

#### options.metadata

- **Type**: `(tokenId: string, imageUrl: string, ctx: NftCallbackContext) => NftTokenMetadata`
- **Required**: Yes
- **Description**: Build token metadata from the minted tokenId and image URL. Use `ctx.collectionSlug` to resolve collection-specific names/descriptions.

#### options.previewStorage

- **Type**: `{ get, delete }` — Optional
- **Description**: If provided, enables preview-first pattern. Looks up pre-generated image instead of generating one at mint time.

#### options.paymentVerification

- **Type**: `{ rpcUrl, serverWalletAddress, expectedCost, txHashStore }` — Optional
- **Description**: If provided, enables server-side payment verification for paid/fee-only collections. The handler verifies the client-provided `paymentTxHash` on-chain before minting.
  - `rpcUrl` — RPC endpoint URL for the target chain (e.g., Base RPC)
  - `serverWalletAddress` — The wallet address users send ETH to
  - `expectedCost(ctx, quantity)` — Returns expected payment in ETH, or `null` for free collections (skips verification)
  - `txHashStore` — Replay protection store with `isUsed(txHash)` and `markUsed(txHash, ctx)` methods

## Returns

- **Type**: `{ POST: (request: Request) => Promise<Response> }`
- **Description**: Next.js route handler. Place at `app/api/nft/mint/route.ts`.

### Response Body

The handler accepts `{ fid, collectionSlug, quantity?, paymentTxHash? }` and responds with:

```typescript
{
  transaction_hash: string;
  tokens: Array<{
    token_id: string;
    image_url: string | null;
    metadata_uri: string | null;
    error?: string; // present if image/metadata failed for this token
  }>;
}
```

## Examples

Multi-collection handler (resolves config from `collectionSlug`):

```typescript
import { createNftMintHandler } from "@/neynar-web-sdk/nextjs";
import { privateConfig } from "@/config/private-config";
import { getCollection } from "@/config/nft-config";

export const { POST } = createNftMintHandler({
  config: ({ collectionSlug }) => {
    const c = getCollection(collectionSlug);
    return {
      apiKey: privateConfig.neynarApiKey,
      walletId: privateConfig.neynarWalletId,
      network: c.network,
      contractAddress: c.contractAddress,
    };
  },
  imagePrompt: ({ collectionSlug, tokenId }) => {
    const c = getCollection(collectionSlug);
    return `${c.tokenImagePrompt}, token #${tokenId}`;
  },
  metadata: (tokenId, imageUrl, { collectionSlug }) => {
    const c = getCollection(collectionSlug);
    return {
      name: `${c.tokenNamePrefix}${tokenId}`,
      description: c.description,
      image: imageUrl,
    };
  },
});
```

With payment verification for paid collections:

```typescript
import {
  createNftMintHandler,
  estimateNftMintCost,
} from "@/neynar-web-sdk/nextjs";

export const { POST } = createNftMintHandler({
  // ...config, imagePrompt, metadata as above...
  paymentVerification: {
    rpcUrl: process.env.BASE_RPC_URL!,
    serverWalletAddress: process.env.NEYNAR_WALLET_ADDRESS!,
    expectedCost: async (ctx, quantity) => {
      const c = getCollection(ctx.collectionSlug);
      if (c.pricingTier === "free") return null;
      return estimateNftMintCost(
        {
          apiKey: privateConfig.neynarApiKey,
          network: c.network,
          contractAddress: c.contractAddress,
        },
        process.env.BASE_RPC_URL!,
        { fid: ctx.fid, quantity },
      );
    },
    txHashStore: {
      isUsed: (txHash) => isPaymentTxUsed(txHash),
      markUsed: (txHash, ctx) =>
        markPaymentTxUsed(txHash, ctx.fid, ctx.collectionSlug),
    },
  },
});
```

## Related

- `estimateNftMintCost` — Standalone utility to estimate total mint cost (Neynar fees + gas). Use inside `expectedCost` callback.
- `createNftPriceHandler` — GET handler factory that exposes pricing to the client. Uses `estimateNftMintCost` internally.
