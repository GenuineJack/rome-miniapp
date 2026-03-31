# createCoinGeckoApiHandler

**Type**: function

Creates CoinGecko-specific API handlers with an instantiated CoinGecko SDK client

This is a CoinGecko-specific wrapper around the generic createRouter that:

- Maps to all CoinGecko SDK methods via dependency injection
- Provides type safety for Coingecko client
- Handles CoinGecko-specific error responses
- Includes sensible CoinGecko-specific CORS defaults

## API Surface

```typescript
import { createCoinGeckoApiHandler } from '@/neynar-web-sdk/nextjs';

export function createCoinGeckoApiHandler(client: Coingecko): MethodHandlers { ... }
```

## Parameters

### client

- **Type**: `Coingecko`
- **Required**: Yes
- **Description**: Instantiated Coingecko client with API key (dependency injection for testability)

## Returns

- **Type**: `MethodHandlers`
- **Description**: Object with HTTP method handlers (GET, POST, PUT, DELETE, etc.)

## Examples

```typescript
import { Coingecko } from "@coingecko/coingecko-typescript";
import { createCoinGeckoApiHandler } from "@/neynar-web-sdk/nextjs";
import { privateConfig } from "@/config/private-config";
const client = new Coingecko({
  demoAPIKey: privateConfig.coingeckoApiKey,
  environment: "demo",
});
export const { GET, POST, PUT, DELETE, OPTIONS } =
  createCoinGeckoApiHandler(client);
```
