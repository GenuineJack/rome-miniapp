# useLikeCast

**Type**: hook

Like a cast

Adds a like reaction to a cast. Automatically invalidates cast reactions and the cast
itself to update UI with new like count and viewer context.

## Import

```typescript
import { useLikeCast } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useLikeCast(
  options?: ExtendedMutationOptions<OperationResponse, ReactionParams>,
): MutationHookResult<OperationResponse, ReactionParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<OperationResponse, ReactionParams>`
- **Required**: No
- **Description**: - Additional mutation options
- `onSuccess?: (data, variables) => void` - Called after successful like
- `onError?: (error) => void` - Called on error

## Returns

```typescript
MutationHookResult<OperationResponse, ReactionParams>;
```

TanStack Query mutation result

- `mutate: (params: { target_hash: string, signer_uuid: string }) => void` - Trigger like
- `isPending: boolean` - True while liking
- `isError: boolean` - True if like failed
- `isSuccess: boolean` - True if like succeeded
  \*Mutation Parameters:\*\*

```typescript
{
target_hash: string;            // Hash of cast to like
signer_uuid: string;            // Signer UUID for authentication
reaction_type?: 'like';         // Reaction type (defaults to 'like')
}
```

## Usage

```typescript
import { useLikeCast } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useLikeCast(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Like button

```tsx
function LikeButton({ cast, signerUuid }: { cast: Cast; signerUuid: string }) {
  const likeMutation = useLikeCast();
  const isLiked = cast.viewer_context?.liked;

  return (
    <button
      onClick={() =>
        likeMutation.mutate({
          target_hash: cast.hash,
          signer_uuid: signerUuid,
        })
      }
      disabled={likeMutation.isPending || isLiked}
    >
      {isLiked ? "❤️" : "🤍"} {cast.reactions.likes_count}
    </button>
  );
}
```

Maps to: POST /reactions
