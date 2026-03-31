# useUpdateNeynarFrame

**Type**: hook

Update Neynar frame

Updates an existing frame in the Neynar frame registry. Use this to modify
frame metadata, URL, description, or other properties. Automatically invalidates
related queries to keep the UI in sync.

## Import

```typescript
import { useUpdateNeynarFrame } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUpdateNeynarFrame(
  options?: ExtendedMutationOptions<
    NeynarFrame,
    NeynarFrameParams & { frame_id: string }
  >,
): MutationHookResult<NeynarFrame, NeynarFrameParams & { frame_id: string }>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  NeynarFrame,
  NeynarFrameParams & { frame_id: string }
  > `
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks

## Returns

```typescript
MutationHookResult<NeynarFrame, NeynarFrameParams & { frame_id: string }>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { useUpdateNeynarFrame } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUpdateNeynarFrame("example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Updating a frame

```tsx
const updateFrame = useUpdateNeynarFrame({
  onSuccess: (result) => {
    console.log("Frame updated successfully:", result);
  },
});

const handleUpdate = () => {
  updateFrame.mutate({
    frame_id: "existing-frame-id",
    name: "Updated Frame Name",
    description: "Updated description",
  });
};
```
