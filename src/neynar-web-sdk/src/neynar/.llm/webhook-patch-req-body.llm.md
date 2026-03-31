# WebhookPatchReqBody

**Type**: type

Webhook patch request body

Request body for updating a webhook's active status.

**Properties:**

- `webhook_id: string` - ID of the webhook to update
- `active: 'true' | 'false'` - Whether the webhook should be active

**Usage Context:**

- Used to enable or disable a webhook without deleting it
- Allows temporary suspension of webhook events
