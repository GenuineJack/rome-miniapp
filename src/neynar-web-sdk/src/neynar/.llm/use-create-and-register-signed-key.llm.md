# useCreateAndRegisterSignedKey

**Type**: hook

Creates a signer and returns the signer status

Convenience mutation that creates a new signer and registers it in a single operation.
This combines signer creation with key registration, returning the signer status and
approval URL.

**Special Behaviors:**

- While testing please reuse the signer, it costs money to approve a signer
- Combines create + register operations into one API call

## Import

```typescript
import { useCreateAndRegisterSignedKey } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useCreateAndRegisterSignedKey(
  options?: ExtendedMutationOptions<
    Signer,
    UseCreateAndRegisterSignedKeyParams
  >,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<Signer, UseCreateAndRegisterSignedKeyParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params) => void` - Trigger signer creation and registration
- `isPending: boolean` - True while creation is in progress
- `isError: boolean` - True if creation failed
- `error: ApiError | null` - Error if failed

## Usage

```typescript
import { useCreateAndRegisterSignedKey } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useCreateAndRegisterSignedKey(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function CreateSigner({ mnemonic }: { mnemonic: string }) {
  const createSigner = useCreateAndRegisterSignedKey({
    onSuccess: (signer) => {
      console.log("Signer created:", signer.signer_uuid);
      console.log("Status:", signer.status);
      if (signer.signer_approval_url) {
        window.location.href = signer.signer_approval_url;
      }
    },
  });

  const handleCreate = () => {
    createSigner.mutate({
      farcasterDeveloperMnemonic: mnemonic,
      deadline: Math.floor(Date.now() / 1000) + 86400,
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createSigner.isPending}>
        {createSigner.isPending
          ? "Creating Signer..."
          : "Create & Register Signer"}
      </button>
      {createSigner.data && (
        <div>
          <p>Signer UUID: {createSigner.data.signer_uuid}</p>
          <p>Status: {createSigner.data.status}</p>
        </div>
      )}
    </div>
  );
}
```
