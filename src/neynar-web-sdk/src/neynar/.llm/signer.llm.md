# Signer

**Type**: type

Signer

A signer key for performing actions on behalf of a user.

**Core Properties:**

- `object?: 'signer'` - Object type identifier
- `signer_uuid: string` - UUID of the signer (paired with API key)
- `public_key: string` - Ed25519 public key
- `status:` {@link SignerStatusEnum} - Signer status (generated, pending_approval, approved, revoked)

**Optional Properties:**

- `signer_approval_url?: string` - URL for user to approve signer
- `fid?: number` - Farcaster ID associated with signer
- `permissions?: Array<SharedSignerPermission>` - Permissions granted to signer
