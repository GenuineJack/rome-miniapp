# useUnlikeCast

**Type**: hook

Unlike a cast

Removes a like reaction from a cast. Automatically invalidates cast reactions and the cast
itself to update UI with the removed like and updated count.

## Import

```typescript
import { useUnlikeCast } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUnlikeCast(
  options?: ExtendedMutationOptions<OperationResponse, ReactionParams>,
): MutationHookResult<OperationResponse, ReactionParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<OperationResponse, ReactionParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks
- `onSuccess?: (data, variables) => void` - Called after successful unlike
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
MutationHookResult<OperationResponse, ReactionParams>;
```

TanStack Query mutation result

- `mutate: (params: { target_hash: string, signer_uuid: string }) => void` - Trigger unlike
- `isPending: boolean` - True while unliking
- `isError: boolean` - True if unlike failed
- `isSuccess: boolean` - True if unlike succeeded
  \*Mutation Parameters:\*\*

```typescript
{
target_hash: string;            // Hash of cast to unlike
signer_uuid: string;            // Signer UUID for authentication
reaction_type?: 'like';         // Reaction type (defaults to 'like')
}
```

## Usage

```typescript
import { useUnlikeCast } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUnlikeCast(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Unlike button

```tsx
function UnlikeButton({
  cast,
  signerUuid,
}: {
  cast: Cast;
  signerUuid: string;
}) {
  const unlikeMutation = useUnlikeCast();
  const isLiked = cast.viewer_context?.liked;

  if (!isLiked) return null;

  return (
    <button
      onClick={() =>
        unlikeMutation.mutate({
          target_hash: cast.hash,
          signer_uuid: signerUuid,
        })
      }
      disabled={unlikeMutation.isPending}
    >
      {unlikeMutation.isPending ? "Unliking..." : "Unlike"}
    </button>
  );
}
```

Maps to: DELETE /reactions
