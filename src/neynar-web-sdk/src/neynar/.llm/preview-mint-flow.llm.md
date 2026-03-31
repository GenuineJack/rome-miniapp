# NftPreviewMintFlow

**Type**: component

Two-step NFT flow: generate preview -> confirm & mint.

Handles the full lifecycle: idle -> generating (skeleton) -> previewing (image + confirm) -> minting -> success | error. Requires both `createNftPreviewHandler` at `app/api/nft/preview/route.ts` and `createNftMintHandler` at `app/api/nft/mint/route.ts`.

## Import

```typescript
import { NftPreviewMintFlow } from "@/neynar-web-sdk/neynar";
```

## Props

```typescript
type NftPreviewMintFlowProps = {
  fid?: number; // Farcaster user FID. Flow auto-disabled when undefined.
  collectionSlug: string; // Which NFT collection to use
  onPreviewGenerated?: (result: NftPreviewResponse) => void;
  onSuccess?: (result: NftMintResponse) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
};
```

## Examples

```tsx
import { NftPreviewMintFlow } from "@/neynar-web-sdk/neynar";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";

function MyPage() {
  const { data: user } = useFarcasterUser();

  return (
    <NftPreviewMintFlow
      fid={user?.fid}
      collectionSlug="cosmic-cats"
      onSuccess={(result) => console.log("Minted!", result.tokens[0]?.token_id)}
    />
  );
}
```
