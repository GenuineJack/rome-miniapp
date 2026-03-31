# useOnchainNetworkNewPools

**Type**: hook

Fetches newly created pools for a specific blockchain network

This hook retrieves the most recently created liquidity pools on a given network,
providing early insights into new trading opportunities and emerging tokens.
Perfect for discovering new projects and monitoring DeFi ecosystem growth.
Data refreshes every minute to capture the latest pool creations.

## Import

```typescript
import { useOnchainNetworkNewPools } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useOnchainNetworkNewPools(
  network: string,
  params?: OnchainCategoryPoolsParams,
  options?: ExtendedQueryOptions<OnchainPool[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### network

- **Type**: `string`
- **Required**: Yes
- **Description**: - Network identifier (e.g., "eth", "bsc", "polygon")

### params

- **Type**: `OnchainCategoryPoolsParams`
- **Required**: No
- **Description**: - Optional pagination parameters

### options

- **Type**: `ExtendedQueryOptions<OnchainPool[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Optional query configuration parameters

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

UseQueryResult containing:

- `data.data[]`: Array of OnchainPool objects sorted by creation date (newest first)
- Each pool includes: id, name, address, tokens, reserve_in_usd, volume_24h, creation timestamp

## Usage

```typescript
import { useOnchainNetworkNewPools } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useOnchainNetworkNewPools("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function NewPoolsTracker({ network }: { network: string }) {
  const { data, isLoading, refetch } = useOnchainNetworkNewPools(network);

  if (isLoading) return <div>Loading new pools...</div>;

  const newPools = data?.data || [];
  const totalNewPools = newPools.length;
  const totalTVL = newPools.reduce(
    (sum, pool) => sum + (pool.reserve_in_usd || 0),
    0,
  );

  return (
    <div>
      <div className="header">
        <h2>New Pools on {network.toUpperCase()}</h2>
        <button onClick={() => refetch()}>Refresh</button>
      </div>

      <div className="summary">
        <span>New Pools: {totalNewPools}</span>
        <span>Combined TVL: ${totalTVL.toLocaleString()}</span>
      </div>

      {newPools.map((pool) => (
        <div key={pool.id} className="new-pool-card">
          <div className="pool-header">
            <h3>
              {pool.tokens.base_token.symbol} / {pool.tokens.quote_token.symbol}
            </h3>
            <span className="new-badge">NEW</span>
          </div>
          <p>{pool.name}</p>
          <div className="pool-stats">
            <span>TVL: ${pool.reserve_in_usd?.toLocaleString() || "N/A"}</span>
            <span>DEX: {pool.dex_id}</span>
            <span>Network: {pool.network}</span>
          </div>
          <button onClick={() => navigator.clipboard.writeText(pool.address)}>
            Copy Address
          </button>
        </div>
      ))}
    </div>
  );
}
```
