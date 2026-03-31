# useSubscriptionCheck

**Type**: hook

Check if a wallet address is subscribed to a given STP (Hypersub) contract.

**Special Behaviors:**

- Not paginated (returns all results in single request)
- Max 350 addresses per request
- Addresses must be comma-separated string format

## Import

```typescript
import { useSubscriptionCheck } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSubscriptionCheck(
  params: UseSubscriptionCheckParams,
  options?: QueryHookOptions<
    SubscriptionCheckResponse,
    SubscriptionCheckResponse
  >,
): QueryHookResult<SubscriptionCheckResponse>;
```

## Parameters

### params

- **Type**: `UseSubscriptionCheckParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `addresses: string` - Comma separated list of Ethereum addresses, up to 350 at a time
- `contract_address: string` - Ethereum address of the STP contract
- `chain_id: string` - Chain ID of the STP contract

e.g., "1" for Ethereum mainnet

### options

- **Type**: `QueryHookOptions<
  SubscriptionCheckResponse,
  SubscriptionCheckResponse
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<SubscriptionCheckResponse>;
```

TanStack Query result with subscription status data

- `data:` `SubscriptionCheckResponse` with:
  Subscription check response

Response checking if user is subscribed.

- `subscribed: boolean` - Whether user is subscribed

## Usage

```typescript
import { useSubscriptionCheck } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSubscriptionCheck(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Single address subscription gate

```tsx
function SubscriptionGate({
  userAddress,
  contractAddress,
}: {
  userAddress: string;
  contractAddress: string;
}) {
  const { data, isLoading, error } = useSubscriptionCheck({
    addresses: userAddress,
    contract_address: contractAddress,
    chain_id: "1", // Ethereum mainnet
  });

  if (isLoading) return <div>Checking subscription status...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const hasActiveSubscription = data?.[userAddress.toLowerCase()]?.status;

  return (
    <div>
      {hasActiveSubscription ? (
        <div>
          <h3>Premium Content</h3>
          <p>You have an active subscription!</p>
          <div>Access granted</div>
        </div>
      ) : (
        <div>
          <h3>Subscription Required</h3>
          <p>Subscribe to access this content.</p>
          <button>Subscribe Now</button>
        </div>
      )}
    </div>
  );
}
```

### Example 2

Bulk subscription check for multiple addresses

```tsx
function BulkSubscriptionCheck({
  addresses,
  contractAddress,
}: {
  addresses: string[];
  contractAddress: string;
}) {
  const { data, isLoading } = useSubscriptionCheck({
    addresses: addresses.join(","), // Max 350 addresses
    contract_address: contractAddress,
    chain_id: "1",
  });

  if (isLoading) return <div>Checking {addresses.length} addresses...</div>;

  const activeSubscribers = addresses.filter(
    (addr) => data?.[addr.toLowerCase()]?.status,
  );

  return (
    <div>
      <h3>Subscription Status</h3>
      <p>
        {activeSubscribers.length} of {addresses.length} addresses have active
        subscriptions
      </p>
      <div>
        {addresses.map((addr) => (
          <div key={addr}>
            <code>
              {addr.slice(0, 6)}...{addr.slice(-4)}
            </code>
            {data?.[addr.toLowerCase()]?.status ? (
              <span>Active</span>
            ) : (
              <span>Inactive</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3

Premium content with expiry warning

```tsx
function PremiumContent({
  userAddress,
  contractAddress,
}: {
  userAddress: string;
  contractAddress: string;
}) {
  const { data } = useSubscriptionCheck({
    addresses: userAddress,
    contract_address: contractAddress,
    chain_id: "1",
  });

  const subscription = data?.[userAddress.toLowerCase()];

  if (!subscription?.status) {
    return <div>Please subscribe to view this content</div>;
  }

  return (
    <div>
      <h2>Premium Content</h2>
      <p>Your exclusive content here...</p>
      {subscription.expires_at && (
        <p>
          Subscription expires:{" "}
          {new Date(subscription.expires_at * 1000).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
```
