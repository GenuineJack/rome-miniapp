# SubscribedTo

**Type**: type

Subscribed to

Represents a subscription relationship with full details including creator info.

**Properties:**

- `object: 'subscription'` - Object type identifier (always 'subscription')
- `provider_name?: string` - Name of the subscription provider
- `contract_address: string` - Smart contract address for the subscription
- `chain: number` - Blockchain chain ID
- `metadata:` {@link SubscriptionMetadata} - Subscription metadata (name, description, etc.)
- `owner_address: string` - Address of the subscription contract owner
- `price:` {@link SubscriptionPrice} - Pricing information for the subscription
- `tiers?: Array<SubscriptionTier>` - Available subscription tiers
- `protocol_version: number` - Version of the subscription protocol
- `token:` {@link SubscriptionToken} - Token information for payment
- `expires_at: string` - ISO timestamp when the subscription expires
- `subscribed_at: string` - ISO timestamp when the subscription started
- `tier:` {@link SubscriptionTier} - Current subscription tier
- `creator:` {@link User} - User who created the subscription

**Usage Context:**

- Returned by subscription queries showing who the user is subscribed to
- Includes full creator user data
