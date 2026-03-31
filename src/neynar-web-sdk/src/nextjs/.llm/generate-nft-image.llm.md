# generateNftImage

**Type**: function

Generate an NFT image using AI via the Neynar API.

Server-side utility with built-in exponential backoff retries. Returns the generated image URL.

## API Surface

```typescript
import { generateNftImage } from "@/neynar-web-sdk/nextjs";

export async function generateNftImage(
  prompt: string,
  config: Pick<NftHandlerConfig, "apiKey" | "walletId">,
  options?: GenerateNftImageOptions,
): Promise<{ image_url: string }>;
```

## Parameters

### prompt

- **Type**: `string`
- **Required**: Yes
- **Description**: AI prompt describing the image to generate.

### config

- **Type**: `Pick<NftHandlerConfig, "apiKey" | "walletId">`
- **Required**: Yes

### options

- **Type**: `GenerateNftImageOptions`
- **Required**: No

| Field               | Type                        | Default | Description                                                 |
| ------------------- | --------------------------- | ------- | ----------------------------------------------------------- |
| `source_image_urls` | `string[]`                  | —       | URLs of source images to edit or use as reference (max 5)   |
| `width`             | `number`                    | `1024`  | Output width in pixels (1-4096)                             |
| `height`            | `number`                    | `1024`  | Output height in pixels (1-4096)                            |
| `format`            | `"png" \| "jpeg" \| "webp"` | `"png"` | Output image format                                         |
| `high_fidelity`     | `boolean`                   | `false` | Use high-fidelity model — only when the image contains text |
| `maxRetries`        | `number`                    | `3`     | Max retry attempts with exponential backoff                 |

## Returns

- **Type**: `{ image_url: string }`
- **Description**: Object containing the generated image URL. Throws if all retries exhausted.

## Examples

```typescript
import { generateNftImage } from "@/neynar-web-sdk/nextjs";

const result = await generateNftImage(
  "A vibrant cosmic cat with nebula patterns",
  {
    apiKey: process.env.NEYNAR_API_KEY!,
    walletId: process.env.NEYNAR_WALLET_ID!,
  },
);
console.log(result.image_url);
```

With image options:

```typescript
const result = await generateNftImage(
  "Edit this photo in a cosmic art style",
  {
    apiKey: process.env.NEYNAR_API_KEY!,
    walletId: process.env.NEYNAR_WALLET_ID!,
  },
  {
    source_image_urls: ["https://example.com/photo.png"],
    width: 512,
    height: 512,
    format: "webp",
  },
);
```
