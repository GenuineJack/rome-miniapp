# useDeleteNeynarFrame

**Type**: hook

Delete Neynar frame

Removes a frame from the Neynar frame registry. This action cannot be undone
and will make the frame unavailable for future interactions. The frame will be
removed from catalog listings and search results.

## Import

```typescript
import { useDeleteNeynarFrame } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeleteNeynarFrame(
  options?: ExtendedMutationOptions<
    DeleteFrameResponse,
    UseDeleteNeynarFrameParams
  >,
): MutationHookResult<DeleteFrameResponse, UseDeleteNeynarFrameParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<DeleteFrameResponse, UseDeleteNeynarFrameParams>`
- **Required**: No
- **Description**: - Mutation options including params and callbacks

## Returns

```typescript
MutationHookResult<DeleteFrameResponse, UseDeleteNeynarFrameParams>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { useDeleteNeynarFrame } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeleteNeynarFrame(/* value */);

  const handleClick = () => {
    result.mutate(/* parameters */);
  };

  return (
    <button onClick={handleClick} disabled={result.isPending}>
      {result.isPending ? 'Loading...' : 'Execute'}
    </button>
  );
}
```

## Examples

Deleting a frame with confirmation

```tsx
const deleteFrame = useDeleteNeynarFrame({
  onSuccess: () => {
    console.log("Frame deleted successfully");
    router.push("/frames");
  },
  onError: (error) => {
    console.error("Failed to delete frame:", error);
  },
});

const handleDelete = () => {
  if (confirm("Are you sure you want to delete this frame?")) {
    deleteFrame.mutate({ frame_id: "frame-to-delete" });
  }
};
```
