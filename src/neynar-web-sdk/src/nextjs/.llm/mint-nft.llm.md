# mintNft

**Type**: function

Mint an NFT via the Neynar API (synchronous mode).

Server-side utility that mints one or more tokens to a Farcaster user by FID. Uses `async: false` to get the token IDs in the response. All tokens are minted in a single transaction. Parses the raw API response and returns `{ transaction_hash, token_ids }`.

## API Surface

```typescript
import { mintNft } from "@/neynar-web-sdk/nextjs";

export async function mintNft(
  params: {
    fid: number;
    quantity?: number;
    network: "base" | "optimism";
    contractAddress: string;
  },
  config: Pick<NftHandlerConfig, "apiKey" | "walletId">,
): Promise<{ transaction_hash: string; token_ids: string[] }>;
```

## Parameters

### params.fid

- **Type**: `number`
- **Required**: Yes
- **Description**: Farcaster user ID to mint to.

### params.quantity

- **Type**: `number`
- **Required**: No
- **Default**: `1`

### params.network

- **Type**: `"base" | "optimism"`
- **Required**: Yes

### params.contractAddress

- **Type**: `string`
- **Required**: Yes

### config

- **Type**: `Pick<NftHandlerConfig, "apiKey" | "walletId">`
- **Required**: Yes

## Returns

- **Type**: `{ transaction_hash: string; token_ids: string[] }`
- **Description**: Transaction hash and minted token IDs. All tokens are minted in a single transaction. Throws on mint failure or if no token IDs returned.

## Examples

```typescript
import { mintNft } from "@/neynar-web-sdk/nextjs";

const result = await mintNft(
  { fid: 12345, quantity: 3, network: "base", contractAddress: "0x1234..." },
  {
    apiKey: process.env.NEYNAR_API_KEY!,
    walletId: process.env.NEYNAR_WALLET_ID!,
  },
);
console.log(result.transaction_hash, result.token_ids);
```
