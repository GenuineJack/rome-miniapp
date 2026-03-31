# useDeveloperManagedAuth

**Type**: hook

Retrieves information about a developer-managed signer address by Ethereum address

## Import

```typescript
import { useDeveloperManagedAuth } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeveloperManagedAuth(
  address: string,
  options?: QueryHookOptions<DeveloperManagedSigner, DeveloperManagedSigner>,
): QueryHookResult<DeveloperManagedSigner>;
```

## Parameters

### address

- **Type**: `string`
- **Required**: Yes
- **Description**: - The Ethereum address to lookup

### options

- **Type**: `QueryHookOptions<DeveloperManagedSigner, DeveloperManagedSigner>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<DeveloperManagedSigner>;
```

TanStack Query result with developer-managed signer data

- `data:` `DeveloperManagedSigner` with:
  Developer managed signer

Signer managed by the developer.

- `signer_uuid: string` - UUID of the signer
- `public_key: string` - Ed25519 public key
- `status: string` - Signer status
- `fid: number` - Farcaster ID

## Usage

```typescript
import { useDeveloperManagedAuth } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeveloperManagedAuth("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function SignerStatus({ address }: { address: string }) {
  const { data: signer, isLoading } = useDeveloperManagedAuth(address);
  if (isLoading) return <div>Loading...</div>;
  return <div>Status: {signer?.status}</div>;
}
```
