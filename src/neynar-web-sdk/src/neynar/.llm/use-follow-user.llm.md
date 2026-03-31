# useFollowUser

**Type**: hook

Follow a user mutation hook

Provides a mutation function to follow a user on Farcaster. Automatically
invalidates related queries to keep the UI in sync. Requires a signer UUID
for authentication and the target user's FID.

## Import

```typescript
import { useFollowUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFollowUser(
  options?: ExtendedMutationOptions<unknown, FollowParams>,
): MutationHookResult<unknown, FollowParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<unknown, FollowParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks
- `onSuccess?: (data, variables) => void` - Called on successful follow
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
MutationHookResult<unknown, FollowParams>;
```

TanStack Query mutation result with mutate function and state

- `mutate: (params: { target_fid: number, signer_uuid: string }) => void` - Trigger follow
- `isPending: boolean` - True while follow is in progress
- `isError: boolean` - True if follow failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if follow succeeded
  \*Mutation Parameters:\*\*

```typescript
{
  target_fid: number; // FID of user to follow
  signer_uuid: string; // Signer UUID for authentication
}
```

## Usage

```typescript
import { useFollowUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFollowUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic follow functionality

```tsx
function FollowButton({
  targetFid,
  signerUuid,
}: {
  targetFid: number;
  signerUuid: string;
}) {
  const followMutation = useFollowUser({
    onSuccess: () => {
      console.log("Successfully followed user!");
      // UI will automatically update due to query invalidation
    },
    onError: (error) => {
      console.error("Failed to follow user:", error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleFollow = () => {
    followMutation.mutate({
      target_fid: targetFid,
      signer_uuid: signerUuid,
    });
  };

  return (
    <button onClick={handleFollow} disabled={followMutation.isPending}>
      {followMutation.isPending ? "Following..." : "Follow"}
    </button>
  );
}
```

### Example 2

Follow with optimistic updates

```tsx
function OptimisticFollowButton({
  user,
  signerUuid,
}: {
  user: User;
  signerUuid: string;
}) {
  const [isOptimisticallyFollowing, setOptimisticallyFollowing] =
    useState(false);
  const followMutation = useFollowUser({
    onMutate: () => {
      setOptimisticallyFollowing(true);
    },
    onSuccess: () => {
      // Keep optimistic state until queries refetch
    },
    onError: () => {
      setOptimisticallyFollowing(false);
    },
  });

  const isFollowing =
    user.viewer_context?.following || isOptimisticallyFollowing;
  const isPending = followMutation.isPending;

  return (
    <button
      onClick={() =>
        followMutation.mutate({
          target_fid: user.fid,
          signer_uuid: signerUuid,
        })
      }
      disabled={isPending || isFollowing}
    >
      {isPending ? "Following..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
```
