# usePublishNeynarFrame

**Type**: hook

Publish Neynar frame

Publishes a new frame to the Neynar frame registry. This makes the frame
discoverable and available for interactions on the Neynar platform. The frame
will appear in catalog searches and can be promoted to users.

## Import

```typescript
import { usePublishNeynarFrame } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishNeynarFrame(
  options?: ExtendedMutationOptions<NeynarFrame, NeynarFrameParams>,
): MutationHookResult<NeynarFrame, NeynarFrameParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<NeynarFrame, NeynarFrameParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks

## Returns

```typescript
MutationHookResult<NeynarFrame, NeynarFrameParams>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { usePublishNeynarFrame } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishNeynarFrame(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Publishing a frame

```tsx
const publishFrame = usePublishNeynarFrame({
  onSuccess: (result) => {
    console.log("Frame published successfully:", result.frame_id);
  },
  onError: (error) => {
    console.error("Failed to publish frame:", error);
  },
});

const handlePublish = () => {
  publishFrame.mutate({
    name: "My Awesome Frame",
    description: "An interactive frame for my users",
    url: "https://myapp.com/frame",
  });
};
```
