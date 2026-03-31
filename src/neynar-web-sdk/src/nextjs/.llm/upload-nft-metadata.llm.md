# uploadNftMetadata

**Type**: function

Upload NFT token metadata via the Neynar API.

Server-side utility with built-in exponential backoff retries. Uploads metadata (name, description, image, attributes) for a minted token. Only the deployer wallet can upload metadata.

## API Surface

```typescript
import { uploadNftMetadata } from "@/neynar-web-sdk/nextjs";

export async function uploadNftMetadata(
  params: {
    tokenId: string;
    network: "base" | "optimism";
    contractAddress: string;
    metadata: NftTokenMetadata;
  },
  config: Pick<NftHandlerConfig, "apiKey" | "walletId">,
  options?: { maxRetries?: number },
): Promise<{ metadata_uri: string }>;
```

## Parameters

### params.tokenId

- **Type**: `string`
- **Required**: Yes
- **Description**: Token ID from the mint response.

### params.network

- **Type**: `"base" | "optimism"`
- **Required**: Yes

### params.contractAddress

- **Type**: `string`
- **Required**: Yes

### params.metadata

- **Type**: `NftTokenMetadata` — `{ name, description?, image, external_url?, animation_url?, background_color?, youtube_url?, attributes? }`
- **Required**: Yes

### config

- **Type**: `Pick<NftHandlerConfig, "apiKey" | "walletId">`
- **Required**: Yes

### options.maxRetries

- **Type**: `number`
- **Required**: No
- **Default**: `3`

## Returns

- **Type**: `{ metadata_uri: string }`
- **Description**: The metadata URI on S3. Throws if all retries exhausted or the API returns an error.

## Examples

```typescript
import { uploadNftMetadata } from "@/neynar-web-sdk/nextjs";

const result = await uploadNftMetadata(
  {
    tokenId: "1",
    network: "base",
    contractAddress: "0x1234...",
    metadata: {
      name: "Cosmic Cat #1",
      description: "A unique cosmic feline",
      image: "https://example.com/image.png",
    },
  },
  {
    apiKey: process.env.NEYNAR_API_KEY!,
    walletId: process.env.NEYNAR_WALLET_ID!,
  },
);
console.log(result.metadata_uri);
```
