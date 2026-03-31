# SignedKeyRequestSponsor

**Type**: type

Signed key request sponsor

Sponsorship configuration for signed key requests.

**Properties:**

- `fid?: number` - FID of the sponsor
- `signature?: string` - Signature from sponsor
- `sponsored_by_neynar?: boolean` - Whether Neynar sponsors the signer (if true, fid/signature ignored)

**Usage Context:**

- Used when creating signers for users
- If `sponsored_by_neynar` is true, Neynar will sponsor on behalf of the user (developer charged in compute units)
