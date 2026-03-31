# useDeleteWebhook

**Type**: hook

Delete a webhook

Permanently removes a webhook and stops all event delivery to its endpoint.
This action cannot be undone.

## Import

```typescript
import { useDeleteWebhook } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeleteWebhook(
  options?: ExtendedMutationOptions<WebhookResponse, WebhookDeleteReqBody>,
): MutationHookResult<WebhookResponse, WebhookDeleteReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<WebhookResponse, WebhookDeleteReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<WebhookResponse, WebhookDeleteReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` WebhookDeleteReqBody`) => void` - Trigger webhook deletion

## Usage

```typescript
import { useDeleteWebhook } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeleteWebhook(/* value */);

  const handleClick = () => {
    result.mutate(/* parameters */);
  };

  return (
    <button onClick={handleClick} disabled={result.isPending}>
      {result.isPending ? 'Loading...' : 'Execute'}
    </button>
  );
}
```

## Examples

```tsx
function DeleteWebhookButton({ webhookId }: { webhookId: string }) {
  const deleteWebhook = useDeleteWebhook({
    onSuccess: () => alert("Webhook deleted"),
  });

  return (
    <button onClick={() => deleteWebhook.mutate({ webhook_id: webhookId })}>
      Delete Webhook
    </button>
  );
}
```
