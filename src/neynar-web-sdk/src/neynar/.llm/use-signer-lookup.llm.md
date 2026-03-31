# useSignerLookup

**Type**: hook

Gets information status of a signer by passing in a signer_uuid

Fetches detailed status information for a specific signer by its UUID. The signer UUID
is paired with your API key and cannot be used with a different API key.

**Special Behaviors:**

- Query automatically enabled only when signer_uuid is provided
- signer_uuid is paired with API key, can't use a uuid made with a different API key

## Import

```typescript
import { useSignerLookup } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSignerLookup(
  params: UseSignerLookupParams,
  options?: ExtendedQueryOptions<Signer>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `UseSignerLookupParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `signer_uuid: string` - UUID of the signer (paired with API key)

### options

- **Type**: `ExtendedQueryOptions<Signer>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query result with signer data

## Usage

```typescript
import { useSignerLookup } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSignerLookup(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function SignerStatus({ signerUuid }: { signerUuid: string }) {
  const { data: signer, isLoading } = useSignerLookup({
    signer_uuid: signerUuid,
  });

  if (isLoading) return <div>Loading signer...</div>;
  if (!signer) return <div>Signer not found</div>;

  return (
    <div>
      <h3>Signer Status</h3>
      <p>UUID: {signer.signer_uuid}</p>
      <p>Status: {signer.status}</p>
      <p>FID: {signer.fid}</p>
      {signer.status === "pending_approval" && signer.signer_approval_url && (
        <a href={signer.signer_approval_url}>Approve Signer</a>
      )}
    </div>
  );
}
```
