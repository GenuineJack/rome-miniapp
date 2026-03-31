# useNotificationTokens

**Type**: hook

Fetch notification tokens

Retrieves notification tokens for frame interactions. These tokens are used
to send push notifications to users who have interacted with frames. Each token
represents a user's opt-in to receive notifications from your frame.

## Import

```typescript
import { useNotificationTokens } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNotificationTokens(
  params?: NotificationTokenParams,
  options?: QueryHookOptions<
    FrameNotificationTokens,
    FrameNotificationTokensNotificationTokensInner[]
  >,
): QueryHookResult<FrameNotificationTokensNotificationTokensInner[]>;
```

## Parameters

### params

- **Type**: `NotificationTokenParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `fids?: string` - Comma separated list of FIDs, up to 100 at a time
- `limit?: number` - Results per page (default: 20, max: 100)
- `cursor?: string` - Pagination cursor

### options

- **Type**: `QueryHookOptions<
  FrameNotificationTokens,
  FrameNotificationTokensNotificationTokensInner[]
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<FrameNotificationTokensNotificationTokensInner[]>;
```

TanStack Query result with notification token data

- `data:` `FrameNotificationTokensNotificationTokensInner` with:
  Frame notification token item

Individual notification token for a frame.

- `object?: "notification_token"` - Type identifier
- `url?: string` - Frame URL
- `token?: string` - Notification token
- `status?: "enabled" | "disabled"` - Token status
- `fid?: number` - Farcaster user ID
- `created_at?: string` - Creation timestamp
- `updated_at?: string` - Last update timestamp

## Usage

```typescript
import { useNotificationTokens } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useNotificationTokens({ fids: "example", limit: 123 });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Fetching all notification tokens

```tsx
const { data: tokens, isLoading } = useNotificationTokens();
```

### Example 2

Fetching tokens for specific FIDs

```tsx
const { data: tokens } = useNotificationTokens({
  fids: "123,456,789",
});
```

## See Also

- ://docs.neynar.com/reference/fetch-notification-tokens
