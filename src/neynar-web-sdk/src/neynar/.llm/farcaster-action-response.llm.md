# FarcasterActionResponse

**Type**: type

Farcaster action response

Dynamic response from publishing a Farcaster action.
The SDK returns a generic object with dynamic properties based on the action type.

**Properties:**

- `[key: string]: unknown` - Dynamic properties based on action type

## Type Definition

```typescript
import { FarcasterActionResponse } from "@/neynar-web-sdk/neynar";

type FarcasterActionResponse = {
  [key: string]: unknown;
};
```
