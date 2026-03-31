# createNftPreviewHandler

**Type**: function

Creates a POST handler for the NFT preview route (preview-first pattern).

Generates an AI image preview and stores it server-side. If a preview already exists for the user, returns it without regenerating. Used alongside `createNftMintHandler` with `previewStorage`.

## API Surface

```typescript
import { createNftPreviewHandler } from "@/neynar-web-sdk/nextjs";

export function createNftPreviewHandler(
  options: CreateNftPreviewHandlerOptions,
): {
  POST: (request: Request) => Promise<Response>;
};
```

## Parameters

### options

- **Type**: `CreateNftPreviewHandlerOptions`
- **Required**: Yes

#### options.config

- **Type**: `Pick<NftHandlerConfig, "apiKey" | "walletId"> | ((ctx: NftCallbackContext) => Pick<NftHandlerConfig, "apiKey" | "walletId">)`
- **Required**: Yes
- **Description**: Static config object or a resolver function. Use a function for multi-collection apps where config may vary.

#### options.imagePrompt

- **Type**: `(ctx: NftCallbackContext) => string | Promise<string>`
- **Required**: Yes
- **Description**: AI prompt for image generation. Use `ctx.collectionSlug` to resolve collection-specific prompts.

#### options.previewStorage

- **Type**: `{ get: (ctx) => Promise<string | null>, save: (ctx, imageUrl) => Promise<void> }`
- **Required**: Yes
- **Description**: Storage for preview images. Typically backed by a database table.

## Returns

- **Type**: `{ POST: (request: Request) => Promise<Response> }`
- **Description**: Next.js route handler. Place at `app/api/nft/preview/route.ts`.

## Examples

```typescript
import { createNftPreviewHandler } from "@/neynar-web-sdk/nextjs";
import { privateConfig } from "@/config/private-config";
import { getCollection } from "@/config/nft-config";
import { getPreview, savePreview } from "@/db/actions/nft-actions";

export const { POST } = createNftPreviewHandler({
  config: () => ({
    apiKey: privateConfig.neynarApiKey,
    walletId: privateConfig.neynarWalletId,
  }),
  imagePrompt: ({ collectionSlug }) =>
    getCollection(collectionSlug).tokenImagePrompt,
  previewStorage: {
    get: ({ fid, collectionSlug }) =>
      getPreview(fid, collectionSlug).then((r) => r?.imageUrl ?? null),
    save: ({ fid, collectionSlug }, imageUrl) =>
      savePreview(fid, collectionSlug, imageUrl),
  },
});
```
