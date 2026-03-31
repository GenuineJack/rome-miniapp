# createNeynarApiHandler

**Type**: function

Creates Neynar-specific API handlers with an instantiated Neynar SDK client

This is a Neynar-specific wrapper around the generic createRouter that:

- Provides sensible Neynar-specific CORS defaults
- Maps to all 126 Neynar SDK methods via dependency injection
- Provides type safety for NeynarAPIClient
- Handles Neynar-specific error responses

## API Surface

```typescript
import { createNeynarApiHandler } from '@/neynar-web-sdk/nextjs';

export function createNeynarApiHandler(client: NeynarAPIClient): MethodHandlers { ... }
```

## Parameters

### client

- **Type**: `NeynarAPIClient`
- **Required**: Yes
- **Description**: Instantiated NeynarAPIClient with API key (dependency injection for testability)

## Returns

- **Type**: `MethodHandlers`
- **Description**: Object with HTTP method handlers (GET, POST, PUT, DELETE, etc.)

## Examples

```typescript
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { createNeynarApiHandler } from "@/neynar-web-sdk/nextjs";
import { privateConfig } from "@/config/private-config";
const client = new NeynarAPIClient(
  new Configuration({
    apiKey: privateConfig.neynarApiKey,
  }),
);
export const { GET, POST, PUT, DELETE, OPTIONS } =
  createNeynarApiHandler(client);
```
