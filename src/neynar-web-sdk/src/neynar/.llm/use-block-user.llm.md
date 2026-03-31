# useBlockUser

**Type**: hook

Adds a block for a given FID

Automatically invalidates block list and feed queries to keep UI in sync.

## Import

```typescript
import { useBlockUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useBlockUser(
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

- `mutate: (params:` UseBlockUserParams`) => void` - Trigger block operation

## Usage

```typescript
import { useBlockUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useBlockUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function BlockButton({
  targetFid,
  signerUuid,
}: {
  targetFid: number;
  signerUuid: string;
}) {
  const blockUser = useBlockUser({
    onSuccess: () => {
      console.log("User blocked successfully");
    },
    onError: (error) => {
      console.error("Failed to block user:", error);
    },
  });

  return (
    <button
      onClick={() =>
        blockUser.mutate({ signer_uuid: signerUuid, blocked_fid: targetFid })
      }
      disabled={blockUser.isPending}
    >
      {blockUser.isPending ? "Blocking..." : "Block User"}
    </button>
  );
}
```
