# useNftPreview

**Type**: hook

Calls the NFT preview route handler (`POST /api/nft/preview`).

Designed to work with `createNftPreviewHandler` from `@/neynar-web-sdk/nextjs`. Generates a preview image that can be reviewed before minting.

## Import

```typescript
import { useNftPreview } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNftPreview(
  options?: BaseMutationOptions,
): UseMutationResult<NftPreviewResponse, ApiError, NftPreviewRequest>;
```

## Parameters

### options

- **Type**: `BaseMutationOptions`
- **Required**: No
- **Description**: TanStack Query mutation options (onSuccess, onError, etc.)

## Request Type

```typescript
type NftPreviewRequest = {
  fid: number;
  collectionSlug: string;
};
```

## Response Type

```typescript
type NftPreviewResponse = {
  image_url: string;
};
```

## Examples

```tsx
import { useNftPreview } from "@/neynar-web-sdk/neynar";

function PreviewButton({ fid }: { fid: number }) {
  const preview = useNftPreview({
    onSuccess: (data) => console.log("Preview:", data.image_url),
  });

  return (
    <button
      onClick={() => preview.mutate({ fid, collectionSlug: "my-collection" })}
      disabled={preview.isPending}
    >
      {preview.isPending ? "Generating..." : "Generate Preview"}
    </button>
  );
}
```
