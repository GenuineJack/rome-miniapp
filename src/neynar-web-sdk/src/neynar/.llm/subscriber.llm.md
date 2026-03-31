# Subscriber

**Type**: type

Subscriber

Represents a subscriber to a subscription with user information.

**Properties:**

- `object: 'subscriber'` - Object type identifier (always 'subscriber')
- `user:` {@link User} - User who is subscribing
- `subscribed_to:` {@link SubscribedToObject} - Details of what they're subscribed to

**Usage Context:**

- Returned by subscriber list queries
- Shows who is subscribed to a particular subscription
