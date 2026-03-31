# useUpdateWebhook

**Type**: hook

Update existing webhook

Modifies an existing webhook's configuration including name, URL, and subscription filters.
The webhook will continue operating with the new configuration after update.

## Import

```typescript
import { useUpdateWebhook } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUpdateWebhook(
  options?: ExtendedMutationOptions<WebhookResponse, WebhookPutReqBody>,
): MutationHookResult<WebhookResponse, WebhookPutReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<WebhookResponse, WebhookPutReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<WebhookResponse, WebhookPutReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` WebhookPutReqBody`) => void` - Trigger webhook update

## Usage

```typescript
import { useUpdateWebhook } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUpdateWebhook(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function UpdateWebhook({ webhookId }: { webhookId: string }) {
  const updateWebhook = useUpdateWebhook({
    onSuccess: () => alert("Webhook updated!"),
  });

  return (
    <button
      onClick={() =>
        updateWebhook.mutate({
          webhook_id: webhookId,
          name: "Updated Webhook",
          url: "https://mybot.example.com/new-webhook",
        })
      }
    >
      Update
    </button>
  );
}
```
