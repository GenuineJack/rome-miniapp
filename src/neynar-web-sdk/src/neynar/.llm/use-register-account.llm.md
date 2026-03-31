# useRegisterAccount

**Type**: hook

Creates a new Farcaster account with the provided signature and details

## Import

```typescript
import { useRegisterAccount } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useRegisterAccount(
  options?: ExtendedMutationOptions<
    RegisterUserResponse,
    UseRegisterAccountParams
  >,
): MutationHookResult<RegisterUserResponse, UseRegisterAccountParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<RegisterUserResponse, UseRegisterAccountParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<RegisterUserResponse, UseRegisterAccountParams>;
```

TanStack Query mutation result

- `mutate: (params:` UseRegisterAccountParams`) => void` - Trigger account registration

## Usage

```typescript
import { useRegisterAccount } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useRegisterAccount(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function RegisterAccount() {
  const { mutate } = useRegisterAccount({
    onSuccess: (data) => console.log("Registered:", data.user),
  });
  return (
    <button
      onClick={() =>
        mutate({ signature, fid, requested_user_custody_address, deadline })
      }
    >
      Register
    </button>
  );
}
```
