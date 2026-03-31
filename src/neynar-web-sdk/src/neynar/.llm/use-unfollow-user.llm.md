# useUnfollowUser

**Type**: hook

Unfollow a user mutation hook

Provides a mutation function to unfollow a user on Farcaster. Automatically
invalidates related queries to keep the UI in sync. Requires a signer UUID
for authentication and the target user's FID.

## Import

```typescript
import { useUnfollowUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUnfollowUser(
  options?: ExtendedMutationOptions<unknown, FollowParams>,
): MutationHookResult<unknown, FollowParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<unknown, FollowParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks
- `onSuccess?: (data, variables) => void` - Called on successful unfollow
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
MutationHookResult<unknown, FollowParams>;
```

TanStack Query mutation result with mutate function and state

- `mutate: (params: { target_fid: number, signer_uuid: string }) => void` - Trigger unfollow
- `isPending: boolean` - True while unfollow is in progress
- `isError: boolean` - True if unfollow failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if unfollow succeeded
  \*Mutation Parameters:\*\*

```typescript
{
  target_fid: number; // FID of user to unfollow
  signer_uuid: string; // Signer UUID for authentication
}
```

## Usage

```typescript
import { useUnfollowUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUnfollowUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic unfollow functionality

```tsx
function UnfollowButton({
  targetFid,
  signerUuid,
}: {
  targetFid: number;
  signerUuid: string;
}) {
  const unfollowMutation = useUnfollowUser({
    onSuccess: () => {
      console.log("Successfully unfollowed user!");
      // UI will automatically update due to query invalidation
    },
    onError: (error) => {
      console.error("Failed to unfollow user:", error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleUnfollow = () => {
    unfollowMutation.mutate({
      target_fid: targetFid,
      signer_uuid: signerUuid,
    });
  };

  return (
    <button
      onClick={handleUnfollow}
      disabled={unfollowMutation.isPending}
      className="text-red-600"
    >
      {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow"}
    </button>
  );
}
```

### Example 2

Combined follow/unfollow toggle button

```tsx
function FollowToggleButton({
  user,
  signerUuid,
}: {
  user: User;
  signerUuid: string;
}) {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isFollowing = user.viewer_context?.following;
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleToggle = () => {
    const mutation = isFollowing ? unfollowMutation : followMutation;
    mutation.mutate({
      target_fid: user.fid,
      signer_uuid: signerUuid,
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={isFollowing ? "bg-gray-200" : "bg-blue-500 text-white"}
    >
      {isPending
        ? isFollowing
          ? "Unfollowing..."
          : "Following..."
        : isFollowing
          ? "Following"
          : "Follow"}
    </button>
  );
}
```
