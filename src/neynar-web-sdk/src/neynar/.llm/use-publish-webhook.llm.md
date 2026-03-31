# usePublishWebhook

**Type**: hook

Create a new webhook

Publishes a new webhook with the specified configuration. The webhook will begin
receiving events based on its subscription filters once active.

## Import

```typescript
import { usePublishWebhook } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishWebhook(
  options?: ExtendedMutationOptions<WebhookResponse, WebhookPostReqBody>,
): MutationHookResult<WebhookResponse, WebhookPostReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<WebhookResponse, WebhookPostReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<WebhookResponse, WebhookPostReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` WebhookPostReqBody`) => void` - Trigger webhook creation

## Usage

```typescript
import { usePublishWebhook } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishWebhook(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function CreateWebhook() {
  const publishWebhook = usePublishWebhook({
    onSuccess: (response) =>
      console.log("Created:", response.webhook?.webhook_id),
  });

  return (
    <button
      onClick={() =>
        publishWebhook.mutate({
          name: "My Bot Webhook",
          url: "https://mybot.example.com/webhook",
          subscription: {
            "cast.created": { author_fids: [123, 456] },
          },
        })
      }
    >
      Create Webhook
    </button>
  );
}
```
