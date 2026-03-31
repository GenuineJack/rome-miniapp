# useUnfollowChannel

**Type**: hook

Unfollow a channel

## Import

```typescript
import { useUnfollowChannel } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUnfollowChannel(
  options?: ExtendedMutationOptions<
    FollowChannelResponse,
    UnfollowChannelParams
  >,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  FollowChannelResponse,
  UnfollowChannelParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling
- `onSuccess?: (data, variables) => void` - Called on successful unfollow
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params: { channel_id: string, signer_uuid: string }) => void` - Trigger unfollow operation
- `isPending: boolean` - True while unfollow is in progress
- `isError: boolean` - True if unfollow failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if unfollow succeeded

## Usage

```typescript
import { useUnfollowChannel } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUnfollowChannel(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function UnfollowChannelButton({
  channelId,
  signerUuid,
}: {
  channelId: string;
  signerUuid: string;
}) {
  const unfollowMutation = useUnfollowChannel({
    onSuccess: () => {
      console.log("Successfully unfollowed channel!");
      // Additional success handling if needed
    },
    onError: (error) => {
      console.error("Failed to unfollow channel:", error.message);
    },
  });

  const handleUnfollow = () => {
    unfollowMutation.mutate({
      channel_id: channelId,
      signer_uuid: signerUuid,
    });
  };

  return (
    <button
      onClick={handleUnfollow}
      disabled={unfollowMutation.isPending}
      className="unfollow-button"
    >
      {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow Channel"}
    </button>
  );
}
```
