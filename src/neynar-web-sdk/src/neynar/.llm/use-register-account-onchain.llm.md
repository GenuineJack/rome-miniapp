# useRegisterAccountOnchain

**Type**: hook

Creates a new Farcaster account with onchain registration

## Import

```typescript
import { useRegisterAccountOnchain } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useRegisterAccountOnchain(
  options?: ExtendedMutationOptions<
    RegisterUserOnChainResponse,
    UseRegisterAccountOnchainParams
  >,
): MutationHookResult<
  RegisterUserOnChainResponse,
  UseRegisterAccountOnchainParams
>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  RegisterUserOnChainResponse,
  UseRegisterAccountOnchainParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<
  RegisterUserOnChainResponse,
  UseRegisterAccountOnchainParams
>;
```

TanStack Query mutation result

- `mutate: (params:` UseRegisterAccountOnchainParams`) => void` - Trigger onchain registration

## Usage

```typescript
import { useRegisterAccountOnchain } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useRegisterAccountOnchain(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function RegisterOnchain() {
  const { mutate } = useRegisterAccountOnchain({
    onSuccess: (data) => console.log("TX:", data.transaction_hash),
  });
  return (
    <button onClick={() => mutate({ registration, idem })}>Register</button>
  );
}
```
