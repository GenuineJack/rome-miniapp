# useCoinsCategories

**Type**: hook

Get coins categories with market data

Fetches comprehensive category information from CoinGecko including market cap,
24-hour changes, volume data, and top coins for each category. Categories represent
different sectors or types of cryptocurrencies (e.g., "DeFi", "NFT", "Gaming").

## Import

```typescript
import { useCoinsCategories } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinsCategories(
  params?: CoinsCategoriesParams,
  options?: ExtendedQueryOptions<CoinCategory[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `CoinsCategoriesParams`
- **Required**: No
- **Description**: - Query parameters for filtering and ordering results

### options

- **Type**: `ExtendedQueryOptions<CoinCategory[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query result containing category data with market information

## Usage

```typescript
import { useCoinsCategories } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinsCategories(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic category listing

```tsx
function CategoriesOverview() {
  const { data: categories, isLoading, error } = useCoinsCategories();

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!categories?.length) return <div>No categories found</div>;

  return (
    <div>
      <h2>Crypto Categories</h2>
      {categories.map((category) => (
        <div key={category.id} className="category-card">
          <h3>{category.name}</h3>
          <p>Market Cap: ${category.market_cap.toLocaleString()}</p>
          <p
            className={
              category.market_cap_change_24h >= 0 ? "positive" : "negative"
            }
          >
            24h: {category.market_cap_change_24h.toFixed(2)}%
          </p>
          <p>Volume: ${category.volume_24h.toLocaleString()}</p>
          {category.top_3_coins && (
            <p>Top coins: {category.top_3_coins.join(", ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Example 2

Ordered by market cap change

```tsx
function TrendingCategories() {
  const { data: categories } = useCoinsCategories({
    order: "market_cap_change_24h_desc",
  });

  return (
    <div>
      <h2>Trending Categories (24h)</h2>
      {categories?.slice(0, 5).map((category) => (
        <div key={category.id}>
          <span>{category.name}</span>
          <span className="change-badge">
            +{category.market_cap_change_24h.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Example 3

Custom caching and error handling

```tsx
function CategoriesWithCustomOptions() {
  const { data, isLoading, refetch } = useCoinsCategories(
    { order: "market_cap_desc" },
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div>
      <button onClick={() => refetch()}>Refresh Categories</button>
      {isLoading ? "Loading..." : `${data?.length || 0} categories`}
    </div>
  );
}
```
