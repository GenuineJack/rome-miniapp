# useUpdateWebhookActiveStatus

**Type**: hook

Update webhook active status

Toggles a webhook's active status without modifying its configuration.
Inactive webhooks will not receive event deliveries.

## Import

```typescript
import { useUpdateWebhookActiveStatus } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUpdateWebhookActiveStatus(
  options?: ExtendedMutationOptions<WebhookResponse, WebhookPatchReqBody>,
): MutationHookResult<WebhookResponse, WebhookPatchReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<WebhookResponse, WebhookPatchReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<WebhookResponse, WebhookPatchReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` WebhookPatchReqBody`) => void` - Trigger status update

## Usage

```typescript
import { useUpdateWebhookActiveStatus } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUpdateWebhookActiveStatus(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function WebhookToggle({ webhook }: { webhook: Webhook }) {
  const updateStatus = useUpdateWebhookActiveStatus({
    onSuccess: () => alert("Status updated!"),
  });

  return (
    <button
      onClick={() =>
        updateStatus.mutate({
          webhook_id: webhook.webhook_id,
          active: webhook.active ? "false" : "true",
        })
      }
    >
      {webhook.active ? "Disable" : "Enable"}
    </button>
  );
}
```
