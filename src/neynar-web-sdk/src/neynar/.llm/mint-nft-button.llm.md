# NftMintButton

**Type**: component

One-click NFT mint button component.

Calls `POST /api/nft/mint` via the `useNftMint` hook. Handles the full lifecycle: idle -> minting (spinner) -> success (shows minted image) | error. Requires `createNftMintHandler` at `app/api/nft/mint/route.ts`.

## Import

```typescript
import { NftMintButton } from "@/neynar-web-sdk/neynar";
```

## Props

```typescript
type NftMintButtonProps = {
  fid?: number; // Farcaster user FID. Button auto-disabled when undefined.
  collectionSlug: string; // Which NFT collection to mint from
  quantity?: number; // Number of tokens to mint (default: 1)
  onSuccess?: (result: NftMintResponse) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost";
  className?: string;
  children?: React.ReactNode; // Custom button label. Defaults to "Mint NFT".
};
```

## Examples

```tsx
import { NftMintButton } from "@/neynar-web-sdk/neynar";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";

function MyPage() {
  const { data: user } = useFarcasterUser();

  return (
    <NftMintButton
      fid={user?.fid}
      collectionSlug="cosmic-cats"
      onSuccess={(result) =>
        console.log(
          "Minted!",
          result.tokens.map((t) => t.token_id),
        )
      }
    />
  );
}
```
