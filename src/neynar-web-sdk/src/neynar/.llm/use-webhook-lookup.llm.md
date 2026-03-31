# useWebhookLookup

**Type**: hook

Fetch a webhook

Retrieves detailed information about a specific webhook including its configuration,
subscription filters, and current status.

## Import

```typescript
import { useWebhookLookup } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useWebhookLookup(
  params: UseWebhookLookupParams,
  options?: QueryHookOptions<WebhookResponse, Webhook>,
): QueryHookResult<Webhook>;
```

## Parameters

### params

- **Type**: `UseWebhookLookupParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `webhookId: string` - Unique identifier for the webhook to retrieve

### options

- **Type**: `QueryHookOptions<WebhookResponse, Webhook>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<Webhook>;
```

TanStack Query result with webhook data

- `data:` `Webhook` with:
  Webhook

Webhook configuration for receiving event notifications.
**Core Properties:**

- `webhook_id: string` - Unique webhook identifier
- `target_url: string` - URL to send webhook events
- `subscription:` WebhookSubscription - Event subscription configuration
- `active: boolean` - Whether webhook is active
  **Optional Properties:**
- `created_at?: string` - ISO timestamp when webhook was created
- `secret?:` WebhookSecret - Secret for verifying webhook signatures

**Referenced Types:**

**WebhookSubscription:**
Webhook subscription

Event subscription configuration for a webhook.

- `event_type: string` - Type of events to subscribe to
- `filters?:` WebhookSubscriptionFilters - Filters for events

**WebhookSecret:**
Webhook secret

Secret for verifying webhook signatures.

- `value: string` - The secret value

**WebhookSubscriptionFilters:**
Webhook subscription filters

Filters for webhook event subscriptions.

- `cast?:` WebhookSubscriptionFiltersCast - Cast filters
- `follow?:` WebhookSubscriptionFiltersFollow - Follow filters
- `reaction?:` WebhookSubscriptionFiltersReaction - Reaction filters
- `user_updated?:` WebhookSubscriptionFiltersUserUpdated - User update filters

## Usage

```typescript
import { useWebhookLookup } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useWebhookLookup(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function WebhookDetails({ webhookId }: { webhookId: string }) {
  const { data: webhook, isLoading } = useWebhookLookup({ webhookId });
  if (isLoading) return <div>Loading...</div>;
  return <div>{webhook?.title}</div>;
}
```
