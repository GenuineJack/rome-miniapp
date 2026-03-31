# useOnchainCategories

**Type**: hook

Fetches available onchain DeFi categories for protocol classification

This hook provides comprehensive data about DeFi protocol categories including
pool counts, total value locked (TVL), and 24-hour volume metrics. Categories
help organize different types of DeFi protocols like DEXs, lending, derivatives, etc.
Data is cached for 1 hour for optimal performance.

## Import

```typescript
import { useOnchainCategories } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useOnchainCategories(
  params?: OnchainCategoriesParams,
  options?: ExtendedQueryOptions<OnchainCategory[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `OnchainCategoriesParams`
- **Required**: No
- **Description**: - Optional pagination and filtering parameters

### options

- **Type**: `ExtendedQueryOptions<OnchainCategory[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Optional query configuration parameters

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

UseQueryResult containing:

- `data.data[]`: Array of OnchainCategory objects with category details
- Each category includes: id, name, description, pool_count, tvl_usd, volume_24h_usd

## Usage

```typescript
import { useOnchainCategories } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useOnchainCategories(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function DeFiCategories() {
  const { data, isLoading, error } = useOnchainCategories({ page: 1 });

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const categories = data?.data || [];

  return (
    <div>
      <h2>DeFi Categories ({categories.length})</h2>
      {categories.map((category) => (
        <div key={category.id} className="category-card">
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          <div className="stats">
            <span>Pools: {category.pool_count}</span>
            <span>TVL: ${category.tvl_usd?.toLocaleString()}</span>
            <span>
              24h Volume: ${category.volume_24h_usd?.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```
