# useDeleteReaction

**Type**: hook

Delete a reaction (like or recast) to a cast

In order to delete a reaction, the `signer_uuid` must be approved.

## Import

```typescript
import { useDeleteReaction } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeleteReaction(
  options?: ExtendedMutationOptions<
    { success: boolean },
    ReactionMutationParams
  >,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<{ success: boolean }, ReactionMutationParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params:` ReactionMutationParams`) => void` - Trigger reaction delete

## Usage

```typescript
import { useDeleteReaction } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeleteReaction(true);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Toggle reaction buttons with like/unlike

```tsx
function ReactionToggle({
  cast,
  signerUuid,
  isLiked,
}: {
  cast: Cast;
  signerUuid: string;
  isLiked: boolean;
}) {
  const publishReaction = usePublishReaction();
  const deleteReaction = useDeleteReaction();

  const toggleLike = () => {
    if (isLiked) {
      deleteReaction.mutate({
        signer_uuid: signerUuid,
        reaction_type: "like",
        target: cast.hash,
      });
    } else {
      publishReaction.mutate({
        signer_uuid: signerUuid,
        reaction_type: "like",
        target: cast.hash,
      });
    }
  };

  return (
    <button onClick={toggleLike} disabled={deleteReaction.isPending}>
      {isLiked ? "❤️" : "🤍"} {cast.reactions.likes_count}
    </button>
  );
}
```
