# Subscription

**Type**: type

Subscription

Represents a subscription contract with pricing and metadata.

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

**Usage Context:**

- Represents the subscription contract itself
- Does not include subscriber-specific data like expiration dates
