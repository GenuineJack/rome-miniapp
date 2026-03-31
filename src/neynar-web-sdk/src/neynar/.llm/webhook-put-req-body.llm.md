# WebhookPutReqBody

**Type**: type

Webhook put request body

Request body for updating an existing webhook.

**Properties:**

- `webhook_id: string` - ID of the webhook to update
- `name: string` - Updated name of the webhook
- `url: string` - Updated target URL to send webhook events
- `subscription?:` {@link WebhookSubscriptionFilters} - Updated event subscription filters (optional)

**Usage Context:**

- Used when updating a webhook's configuration
- All fields except subscription are required
