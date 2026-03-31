# useUnblockUser

**Type**: hook

Deletes a block for a given FID

Automatically invalidates block list and feed queries to keep UI in sync.

## Import

```typescript
import { useUnblockUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUnblockUser(
  options?: ExtendedMutationOptions<OperationResponse, BlockReqBody>,
): MutationHookResult<OperationResponse, BlockReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<OperationResponse, BlockReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<OperationResponse, BlockReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` UseUnblockUserParams`) => void` - Trigger unblock operation

## Usage

```typescript
import { useUnblockUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUnblockUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function UnblockButton({
  targetFid,
  signerUuid,
}: {
  targetFid: number;
  signerUuid: string;
}) {
  const unblockUser = useUnblockUser({
    onSuccess: () => {
      console.log("User unblocked successfully");
    },
    onError: (error) => {
      console.error("Failed to unblock user:", error);
    },
  });

  return (
    <button
      onClick={() =>
        unblockUser.mutate({ signer_uuid: signerUuid, blocked_fid: targetFid })
      }
      disabled={unblockUser.isPending}
    >
      {unblockUser.isPending ? "Unblocking..." : "Unblock User"}
    </button>
  );
}
```
