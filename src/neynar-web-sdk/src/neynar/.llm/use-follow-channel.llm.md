# useFollowChannel

**Type**: hook

Follow a channel

## Import

```typescript
import { useFollowChannel } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFollowChannel(
  options?: ExtendedMutationOptions<FollowChannelResponse, FollowChannelParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<FollowChannelResponse, FollowChannelParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling
- `onSuccess?: (data, variables) => void` - Called on successful follow
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params: { channel_id: string, signer_uuid: string }) => void` - Trigger follow operation
- `isPending: boolean` - True while follow is in progress
- `isError: boolean` - True if follow failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if follow succeeded

## Usage

```typescript
import { useFollowChannel } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFollowChannel(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function FollowChannelButton({
  channelId,
  signerUuid,
}: {
  channelId: string;
  signerUuid: string;
}) {
  const followMutation = useFollowChannel({
    onSuccess: () => {
      console.log("Successfully followed channel!");
      // Additional success handling if needed
    },
    onError: (error) => {
      console.error("Failed to follow channel:", error.message);
    },
  });

  const handleFollow = () => {
    followMutation.mutate({
      channel_id: channelId,
      signer_uuid: signerUuid,
    });
  };

  return (
    <button
      onClick={handleFollow}
      disabled={followMutation.isPending}
      className="follow-button"
    >
      {followMutation.isPending ? "Following..." : "Follow Channel"}
    </button>
  );
}
```
