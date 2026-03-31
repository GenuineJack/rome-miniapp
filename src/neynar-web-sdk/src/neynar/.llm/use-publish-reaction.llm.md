# usePublishReaction

**Type**: hook

Post a reaction (like or recast) to a given cast

In order to post a reaction, the `signer_uuid` must be approved.

## Import

```typescript
import { usePublishReaction } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishReaction(
  options?: ExtendedMutationOptions<{ hash: string }, ReactionMutationParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<{ hash: string }, ReactionMutationParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params:` ReactionMutationParams`) => void` - Trigger reaction publish

## Usage

```typescript
import { usePublishReaction } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishReaction("example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic like and recast buttons

```tsx
function ReactionButtons({
  cast,
  signerUuid,
}: {
  cast: Cast;
  signerUuid: string;
}) {
  const publishReaction = usePublishReaction();

  const handleLike = () => {
    publishReaction.mutate({
      signer_uuid: signerUuid,
      reaction_type: "like",
      target: cast.hash,
    });
  };

  return (
    <button onClick={handleLike} disabled={publishReaction.isPending}>
      ❤️ {cast.reactions.likes_count}
    </button>
  );
}
```
