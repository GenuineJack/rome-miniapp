# useSigners

**Type**: hook

Fetches a list of signers for a custody address

**Special Behaviors:**

- Requires SIWE authentication (both message and signature are mandatory)
- Not paginated (returns all signers in single response)
- SIWE message must follow EIP-4361 standard

## Import

```typescript
import { useSigners } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSigners(
  params: UseSignersParams,
  options?: ExtendedQueryOptions<{ signers: Signer[] }, Signer[]>,
): QueryHookResult<Signer[]>;
```

## Parameters

### params

- **Type**: `UseSignersParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `message: string` - A Sign-In with Ethereum (SIWE) message that the user's Ethereum wallet signs.

This message includes details such as the domain, address, statement, URI, nonce,
and other relevant information following the EIP-4361 standard. It should be
structured and URL-encoded.

- `signature: string` - The digital signature produced by signing the provided SIWE message with the
  user's Ethereum private key.

This signature is used to verify the authenticity of the message and the identity
of the signer.

### options

- **Type**: `ExtendedQueryOptions<{ signers: Signer[] }, Signer[]>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<Signer[]>;
```

TanStack Query result with signer array

- `data:` `Signer` with:
  Signer

A signer key for performing actions on behalf of a user.
**Core Properties:**

- `object?: 'signer'` - Object type identifier
- `signer_uuid: string` - UUID of the signer (paired with API key)
- `public_key: string` - Ed25519 public key
- `status:` SignerStatusEnum - Signer status (generated, pending_approval, approved, revoked)
  **Optional Properties:**
- `signer_approval_url?: string` - URL for user to approve signer
- `fid?: number` - Farcaster ID associated with signer
- `permissions?: Array<SharedSignerPermission>` - Permissions granted to signer

**Referenced Types:**

## Usage

```typescript
import { useSigners } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSigners(/* value */, []);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Fetch signers with SIWE authentication

```tsx
function SignersList({
  siweMessage,
  signature,
}: {
  siweMessage: string;
  signature: string;
}) {
  const { data: signers, isLoading } = useSigners({
    message: siweMessage,
    signature,
  });

  if (isLoading) return <div>Loading signers...</div>;

  return (
    <div>
      <h2>Your Signers</h2>
      {signers?.map((signer) => (
        <div key={signer.signer_uuid}>
          <span>{signer.public_key.slice(0, 10)}...</span>
          <span>Status: {signer.status}</span>
        </div>
      ))}
    </div>
  );
}
```
