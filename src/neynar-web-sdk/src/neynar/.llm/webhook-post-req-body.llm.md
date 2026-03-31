# WebhookPostReqBody

**Type**: type

Webhook post request body

Request body for creating a new webhook.

**Properties:**

- `name: string` - Name of the webhook
- `url: string` - Target URL to send webhook events
- `subscription?:` {@link WebhookSubscriptionFilters} - Event subscription filters (optional)

**Usage Context:**

- Used when creating a new webhook
- Subscription filters determine which events trigger the webhook
