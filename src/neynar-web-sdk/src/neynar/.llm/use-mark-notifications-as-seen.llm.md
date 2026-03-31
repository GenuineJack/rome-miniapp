# useMarkNotificationsAsSeen

**Type**: hook

Mark notifications as seen mutation hook

Provides a mutation function to mark notifications as seen/read. Automatically
invalidates all notification queries to keep the UI in sync. Supports marking
all notifications or filtering by specific notification type.

**Authorization Methods:**

1. Provide a valid signer_uuid in the request body (most common)
2. Provide a valid, signed "Bearer" token in the request's Authorization header

## Import

```typescript
import { useMarkNotificationsAsSeen } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useMarkNotificationsAsSeen(
  options?: ExtendedMutationOptions<unknown, MarkNotificationsSeenParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<unknown, MarkNotificationsSeenParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling
- `onSuccess?: (data, variables) => void` - Called on successful update
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params: { signer_uuid?: string, type?: string }) => void` - Trigger mark as seen
- `isPending: boolean` - True while update is in progress
- `isError: boolean` - True if update failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if update succeeded
  \*Mutation Parameters:\*\*

```typescript
{
signer_uuid?: string;  // UUID of signer with write permission (required unless Bearer token provided)
type?: "follows" | "recasts" | "likes" | "mentions" | "replies" | "quotes";  // Notification type (if omitted, all marked as seen)
}
```

## Usage

```typescript
import { useMarkNotificationsAsSeen } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useMarkNotificationsAsSeen(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function NotificationCenter({ signerUuid }: { signerUuid: string }) {
  const markSeenMutation = useMarkNotificationsAsSeen();

  const handleMarkAllRead = () => {
    markSeenMutation.mutate({ signer_uuid: signerUuid });
  };

  return (
    <button onClick={handleMarkAllRead} disabled={markSeenMutation.isPending}>
      Mark All Read
    </button>
  );
}
```
