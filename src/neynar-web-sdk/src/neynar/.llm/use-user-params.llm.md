# UseUserParams

**Type**: type

Parameters for user query hooks

Optional parameters to enhance user data with additional context.

## Type Definition

```typescript
import { UseUserParams } from "@/neynar-web-sdk/neynar";

type UseUserParams = {
  /**
   * When provided, adds `viewer_context` to response with relationship status
   * (following, followed_by, blocking, blocked_by)
   */
  viewer_fid?: number;

  /**
   * Enables experimental features including spam score filtering
   * @see {@link https://neynar.notion.site/Experimental-Features-1d2655195a8b80eb98b4d4ae7b76ae4a}
   */
  x_neynar_experimental?: boolean;
};
```

## Type Properties

### viewer_fid

- **Type**: `number`
- **Required**: No
- **Description**: When provided, adds `viewer_context` to response with relationship status
  (following, followed_by, blocking, blocked_by)

### x_neynar_experimental

- **Type**: `boolean`
- **Required**: No
- **Description**: Enables experimental features including spam score filtering
