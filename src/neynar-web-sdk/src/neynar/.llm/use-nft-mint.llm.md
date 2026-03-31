# useNftMint

**Type**: hook

Calls the NFT mint route handler (`POST /api/nft/mint`).

Designed to work with `createNftMintHandler` from `@/neynar-web-sdk/nextjs`. Invalidates onchain and user queries on success. Returns a TanStack Query mutation.

## Import

```typescript
import { useNftMint } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNftMint(
  options?: BaseMutationOptions,
): UseMutationResult<NftMintResponse, ApiError, NftMintRequest>;
```

## Parameters

### options

- **Type**: `BaseMutationOptions`
- **Required**: No
- **Description**: TanStack Query mutation options (onSuccess, onError, etc.)

## Request Type

```typescript
type NftMintRequest = {
  fid: number;
  collectionSlug: string;
  quantity?: number; // default: 1
  paymentTxHash?: string; // required for paid collections
};
```

## Response Type

```typescript
type NftMintTokenResult = {
  token_id: string;
  image_url: string | null;
  metadata_uri: string | null;
  error?: string; // Present if image/metadata failed for this token
};

type NftMintResponse = {
  transaction_hash: string;
  tokens: NftMintTokenResult[];
};
```

## Examples

```tsx
import { useNftMint } from "@/neynar-web-sdk/neynar";

function MintButton({ fid }: { fid: number }) {
  const mint = useNftMint({
    onSuccess: (data) =>
      console.log(
        "Minted!",
        data.tokens.map((t) => t.token_id),
      ),
  });

  return (
    <button
      onClick={() =>
        mint.mutate({ fid, collectionSlug: "my-collection", quantity: 3 })
      }
      disabled={mint.isPending}
    >
      {mint.isPending ? "Minting..." : "Mint NFT"}
    </button>
  );
}
```
