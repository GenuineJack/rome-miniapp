# FarcasterActionReqBody

**Type**: type

Farcaster action request body

Request body for publishing a Farcaster action.

**Properties:**

- `signer_uuid: string` - The signer_uuid of the user on behalf of whom the action is being performed
- `base_url: string` - The base URL of the app on which the action is being performed
- `action:` {@link FarcasterActionReqBodyAction} - Action details including type and payload
