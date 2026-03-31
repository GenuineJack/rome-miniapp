# TransactionSendFungiblesRecipient

**Type**: type

Transaction send fungibles recipient

Recipient configuration for sending fungible tokens.

**Properties:**

- `address: string` - Recipient wallet address (required — the raw API does NOT accept FID)
- `amount: string` - Amount to send (in smallest unit, e.g., wei for 18-decimal tokens)

**Note:** This is the raw Neynar API recipient type. The `useSendFungibles()` SDK hook accepts `fid` as an alternative to `address` and resolves it internally, but when calling the API directly (e.g., in server routes via `fetch`), you must provide `address`. Use the Neynar user API to look up a verified wallet address from an FID first.
