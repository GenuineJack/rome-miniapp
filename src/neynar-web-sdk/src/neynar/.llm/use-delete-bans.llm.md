# useDeleteBans

**Type**: hook

Deletes a list of FIDs from the app associated with your API key

Unbanned users, their casts and reactions will once again appear in feeds.

## Import

```typescript
import { useDeleteBans } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeleteBans(
  options?: ExtendedMutationOptions<BanResponse, DeleteBansParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<BanResponse, DeleteBansParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params:` DeleteBansParams`) => void` - Trigger unban operation

## Usage

```typescript
import { useDeleteBans } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeleteBans(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function UnbanButton({ fid }: { fid: number }) {
  const unbanMutation = useDeleteBans({
    onSuccess: () => console.log("User unbanned"),
  });

  return (
    <button
      onClick={() => unbanMutation.mutate({ fids: [fid] })}
      disabled={unbanMutation.isPending}
    >
      {unbanMutation.isPending ? "Unbanning..." : "Unban User"}
    </button>
  );
}
```
