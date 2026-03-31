# useRegisterDeveloperManagedSignedKey

**Type**: hook

Registers a signed key for developer-managed authentication

## Import

```typescript
import { useRegisterDeveloperManagedSignedKey } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useRegisterDeveloperManagedSignedKey(
  options?: ExtendedMutationOptions<
    RegisterSignedKeyForDeveloperManagedAuthAddress200Response,
    UseRegisterDeveloperManagedSignedKeyParams
  >,
): MutationHookResult<
  RegisterSignedKeyForDeveloperManagedAuthAddress200Response,
  UseRegisterDeveloperManagedSignedKeyParams
>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  RegisterSignedKeyForDeveloperManagedAuthAddress200Response,
  UseRegisterDeveloperManagedSignedKeyParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<
  RegisterSignedKeyForDeveloperManagedAuthAddress200Response,
  UseRegisterDeveloperManagedSignedKeyParams
>;
```

TanStack Query mutation result

- `mutate: (params:` UseRegisterDeveloperManagedSignedKeyParams`) => void` - Trigger key registration

## Usage

```typescript
import { useRegisterDeveloperManagedSignedKey } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useRegisterDeveloperManagedSignedKey(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function RegisterKey() {
  const { mutate } = useRegisterDeveloperManagedSignedKey({
    onSuccess: (data) => console.log("Registered:", data.status),
  });
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24h recommended
  return (
    <button
      onClick={() => mutate({ public_key, signature, app_fid, deadline })}
    >
      Register
    </button>
  );
}
```
