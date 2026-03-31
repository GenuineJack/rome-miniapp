# useDeleteCast

**Type**: hook

Delete a cast

Permanently removes a cast from Farcaster. Automatically invalidates relevant feeds
and the cast itself to update UI. This action cannot be undone.

## Import

```typescript
import { useDeleteCast } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeleteCast(
  options?: ExtendedMutationOptions<
    OperationResponse,
    { cast_hash: string; signer_uuid: string }
  >,
): MutationHookResult<
  OperationResponse,
  { cast_hash: string; signer_uuid: string }
>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  OperationResponse,
  { cast_hash: string; signer_uuid: string }
  > `
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks
- `onSuccess?: (data, variables) => void` - Called after successful deletion
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
MutationHookResult<
  OperationResponse,
  { cast_hash: string; signer_uuid: string }
>;
```

TanStack Query mutation result

- `mutate: (params: { cast_hash: string, signer_uuid: string }) => void` - Trigger delete
- `isPending: boolean` - True while deleting
- `isError: boolean` - True if delete failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if delete succeeded
  \*Mutation Parameters:\*\*

```typescript
{
  cast_hash: string; // Hash of cast to delete
  signer_uuid: string; // Signer UUID for authentication (must own the cast)
}
```

## Usage

```typescript
import { useDeleteCast } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeleteCast("example");

  const handleClick = () => {
    result.mutate(/* parameters */);
  };

  return (
    <button onClick={handleClick} disabled={result.isPending}>
      {result.isPending ? 'Loading...' : 'Execute'}
    </button>
  );
}
```

## Examples

Delete cast with confirmation

```tsx
function DeleteCastButton({
  cast,
  signerUuid,
}: {
  cast: Cast;
  signerUuid: string;
}) {
  const deleteMutation = useDeleteCast({
    onSuccess: () => {
      console.log("Cast deleted successfully");
    },
    onError: (error) => alert("Failed to delete: " + error.message),
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this cast?")) {
      deleteMutation.mutate({
        cast_hash: cast.hash,
        signer_uuid: signerUuid,
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      className="text-red-600"
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

Maps to: DELETE /casts
