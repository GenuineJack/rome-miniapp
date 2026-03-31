# useRegisterSignedKey

**Type**: hook

Registers an app FID, deadline and a signature

Registers a signed key with an app FID and deadline. Returns the signer status with an
approval URL that users can visit to approve the signer. This is a critical step in the
signer authentication flow.

## Import

```typescript
import { useRegisterSignedKey } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useRegisterSignedKey(
  options?: ExtendedMutationOptions<Signer, UseRegisterSignedKeyParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<Signer, UseRegisterSignedKeyParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params) => void` - Trigger key registration
- `isPending: boolean` - True while registration is in progress
- `isError: boolean` - True if registration failed
- `error: ApiError | null` - Error if failed

## Usage

```typescript
import { useRegisterSignedKey } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useRegisterSignedKey(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function RegisterKey({
  signerUuid,
  signature,
  appFid,
  deadline,
}: {
  signerUuid: string;
  signature: string;
  appFid: number;
  deadline: number;
}) {
  const registerKey = useRegisterSignedKey({
    onSuccess: (data) => {
      console.log("Key registered:", data.signer_uuid);
      if (data.signer_approval_url) {
        window.location.href = data.signer_approval_url;
      }
    },
  });

  const handleRegister = () => {
    registerKey.mutate({
      signer_uuid: signerUuid,
      signature,
      app_fid: appFid,
      deadline,
    });
  };

  return (
    <button onClick={handleRegister} disabled={registerKey.isPending}>
      {registerKey.isPending ? "Registering..." : "Register Key"}
    </button>
  );
}
```
