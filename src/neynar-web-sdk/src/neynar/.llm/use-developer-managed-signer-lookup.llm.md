# useDeveloperManagedSignerLookup

**Type**: hook

Fetches the status of a developer managed signer by public key

Retrieves status information for a developer-managed signer using its Ed25519 public key.
Developer-managed signers give you more control over key management compared to standard signers.

**Special Behaviors:**

- Query automatically enabled only when public_key is provided

## Import

```typescript
import { useDeveloperManagedSignerLookup } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeveloperManagedSignerLookup(
  params: UseDeveloperManagedSignerLookupParams,
  options?: ExtendedQueryOptions<Signer>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `UseDeveloperManagedSignerLookupParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `public_key: string` - Ed25519 public key

### options

- **Type**: `ExtendedQueryOptions<Signer>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query result with developer-managed signer data

## Usage

```typescript
import { useDeveloperManagedSignerLookup } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeveloperManagedSignerLookup(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function DeveloperSignerStatus({ publicKey }: { publicKey: string }) {
  const { data: signer, isLoading } = useDeveloperManagedSignerLookup({
    public_key: publicKey,
  });

  if (isLoading) return <div>Loading developer signer...</div>;
  if (!signer) return <div>Signer not found</div>;

  return (
    <div>
      <h3>Developer-Managed Signer</h3>
      <p>UUID: {signer.signer_uuid}</p>
      <p>Public Key: {signer.public_key}</p>
      <p>Status: {signer.status}</p>
      <p>FID: {signer.fid}</p>
      {signer.status === "pending_approval" && (
        <span>Awaiting approval...</span>
      )}
    </div>
  );
}
```
