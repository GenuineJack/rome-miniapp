# useSubscriptions

**Type**: hook

Fetch created subscriptions for a given FID's.

**Special Behaviors:**

- Not paginated (returns all created subscriptions in single request)
- Only supports "fabric_stp" provider

## Import

```typescript
import { useSubscriptions } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSubscriptions(
  params: UseSubscriptionsParams,
  options?: QueryHookOptions<SubscriptionsResponse, Subscription[]>,
): QueryHookResult<Subscription[]>;
```

## Parameters

### params

- **Type**: `UseSubscriptionsParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)
- `subscription_provider: "fabric_stp"` - The provider of the subscription (only "fabric_stp" is currently supported)

### options

- **Type**: `QueryHookOptions<SubscriptionsResponse, Subscription[]>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<Subscription[]>;
```

TanStack Query result with subscription offering data

- `data:` `Subscription` with:
  Subscription

Represents a subscription contract with pricing and metadata.

- `object: 'subscription'` - Object type identifier (always 'subscription')
- `provider_name?: string` - Name of the subscription provider
- `contract_address: string` - Smart contract address for the subscription
- `chain: number` - Blockchain chain ID
- `metadata:` SubscriptionMetadata - Subscription metadata (name, description, etc.)
- `owner_address: string` - Address of the subscription contract owner
- `price:` SubscriptionPrice - Pricing information for the subscription
- `tiers?: Array<SubscriptionTier>` - Available subscription tiers
- `protocol_version: number` - Version of the subscription protocol
- `token:` SubscriptionToken - Token information for payment

**Referenced Types:**

## Usage

```typescript
import { useSubscriptions } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSubscriptions(/* value */, []);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic subscription offerings list

```tsx
function CreatorSubscriptions({ fid }: { fid: number }) {
  const {
    data: subscriptions,
    isLoading,
    error,
  } = useSubscriptions({
    fid,
    subscription_provider: "fabric_stp",
  });

  if (isLoading) return <div>Loading subscriptions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Your Subscriptions ({subscriptions?.length || 0})</h2>
      {subscriptions?.map((subscription) => (
        <div key={subscription.contract_address}>
          {subscription.metadata.art_url && (
            <img
              src={subscription.metadata.art_url}
              alt={subscription.metadata.title}
            />
          )}
          <h3>{subscription.metadata.title}</h3>
          <p>Symbol: {subscription.metadata.symbol}</p>
          <div>
            <span>
              Price: {subscription.price.tokens_per_period}{" "}
              {subscription.token.symbol}
            </span>
            <span>Chain: {subscription.chain}</span>
          </div>
          <button>Edit Subscription</button>
        </div>
      ))}
    </div>
  );
}
```

### Example 2

Subscription analytics dashboard

```tsx
function SubscriptionAnalytics({ creatorFid }: { creatorFid: number }) {
  const { data: subscriptions } = useSubscriptions({
    fid: creatorFid,
    subscription_provider: "fabric_stp",
  });

  const avgPeriodDuration =
    subscriptions && subscriptions.length > 0
      ? subscriptions.reduce(
          (sum, sub) => sum + sub.price.period_duration_seconds,
          0,
        ) / subscriptions.length
      : 0;

  return (
    <div>
      <h3>Subscription Analytics</h3>
      <div>
        <p>Total Offerings: {subscriptions?.length || 0}</p>
        <p>
          Average Period Duration: {(avgPeriodDuration / 86400).toFixed(1)} days
        </p>
        <p>
          Chains:{" "}
          {subscriptions
            ? [...new Set(subscriptions.map((s) => s.chain))].join(", ")
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
```

### Example 3

Creator dashboard with top subscriptions

```tsx
function CreatorDashboard({ fid }: { fid: number }) {
  const { data: subscriptions, isLoading } = useSubscriptions({
    fid,
    subscription_provider: "fabric_stp",
  });

  if (isLoading) return <div>Loading...</div>;

  const recentSubscriptions = subscriptions?.slice(0, 3) || [];

  return (
    <div>
      <h2>Recent Subscriptions</h2>
      {recentSubscriptions.map((sub, idx) => (
        <div key={sub.contract_address}>
          <span>#{idx + 1}</span>
          <h4>{sub.metadata.title}</h4>
          <p>Chain: {sub.chain}</p>
          <p>
            Period: {(sub.price.period_duration_seconds / 86400).toFixed(0)}{" "}
            days
          </p>
          <p>
            Price: {sub.price.tokens_per_period} {sub.token.symbol}
          </p>
        </div>
      ))}
    </div>
  );
}
```
