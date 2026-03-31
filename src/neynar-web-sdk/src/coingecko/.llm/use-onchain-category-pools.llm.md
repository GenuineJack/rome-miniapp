# useOnchainCategoryPools

**Type**: hook

Fetches pools belonging to a specific DeFi category

This hook retrieves all liquidity pools that belong to a particular DeFi category,
providing detailed pool information including token pairs, reserves, volume, and
price changes. Essential for analyzing specific sectors of the DeFi ecosystem.
Data refreshes every 5 minutes to provide up-to-date pool metrics.

## Import

```typescript
import { useOnchainCategoryPools } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useOnchainCategoryPools(
  categoryId: string,
  params?: OnchainCategoryPoolsParams,
  options?: ExtendedQueryOptions<OnchainPool[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### categoryId

- **Type**: `string`
- **Required**: Yes
- **Description**: - Unique identifier for the DeFi category

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

- `data.data[]`: Array of OnchainPool objects for the category
- Each pool includes: id, name, address, network, dex_id, tokens, reserve_in_usd, volume_24h, price_change_percentage

## Usage

```typescript
import { useOnchainCategoryPools } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useOnchainCategoryPools("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function CategoryPools({ categoryId }: { categoryId: string }) {
  const { data, isLoading } = useOnchainCategoryPools(categoryId, { page: 1 });

  if (isLoading) return <div>Loading category pools...</div>;

  const pools = data?.data || [];
  const totalTVL = pools.reduce(
    (sum, pool) => sum + (pool.reserve_in_usd || 0),
    0,
  );

  return (
    <div>
      <h2>Category Pools</h2>
      <p>Total TVL: ${totalTVL.toLocaleString()}</p>

      {pools.map((pool) => (
        <div key={pool.id} className="pool-card">
          <h3>{pool.name}</h3>
          <div className="token-pair">
            {pool.tokens.base_token.symbol} / {pool.tokens.quote_token.symbol}
          </div>
          <div className="metrics">
            <span>TVL: ${pool.reserve_in_usd?.toLocaleString()}</span>
            <span>24h Volume: ${pool.volume_24h?.usd?.toLocaleString()}</span>
            <span
              className={
                pool.price_change_percentage?.["24h"] > 0
                  ? "positive"
                  : "negative"
              }
            >
              24h: {pool.price_change_percentage?.["24h"]?.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```
