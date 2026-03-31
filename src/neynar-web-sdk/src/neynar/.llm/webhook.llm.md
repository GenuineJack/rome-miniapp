# Webhook

**Type**: type

Webhook

Webhook configuration for receiving event notifications.

**Core Properties:**

- `webhook_id: string` - Unique webhook identifier
- `target_url: string` - URL to send webhook events
- `subscription:` {@link WebhookSubscription} - Event subscription configuration
- `active: boolean` - Whether webhook is active

**Optional Properties:**

- `created_at?: string` - ISO timestamp when webhook was created
- `secret?:` {@link WebhookSecret} - Secret for verifying webhook signatures
