# usePostFrameAction

**Type**: hook

Post frame action

Submits a frame action to process user interactions with frames. This mutation
handles button clicks, input submissions, and other frame interactions, processing
the signed frame message and returning the next frame state or action result.

## Import

```typescript
import { usePostFrameAction } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePostFrameAction(
  options?: ExtendedMutationOptions<FrameAction, FrameActionParams>,
): MutationHookResult<FrameAction, FrameActionParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<FrameAction, FrameActionParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks

## Returns

```typescript
MutationHookResult<FrameAction, FrameActionParams>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { usePostFrameAction } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePostFrameAction(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic frame action

```tsx
const postFrameAction = usePostFrameAction({
  onSuccess: (result) => {
    console.log("Frame action successful:", result);
  },
});

const handleFrameAction = () => {
  postFrameAction.mutate({
    untrustedData: {
      fid: 123,
      url: "https://example.com/frame",
      messageHash: "0x...",
      timestamp: Date.now(),
      network: 1,
      buttonIndex: 1,
    },
    trustedData: {
      messageBytes: "encoded_message",
    },
  });
};
```
