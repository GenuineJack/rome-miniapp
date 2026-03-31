# useCoinsMarkets

**Type**: hook

Get coins market data with infinite scroll pagination

Fetches market data for coins with comprehensive pricing, volume, and ranking information.
Uses infinite query pattern for efficient pagination, loading additional pages as needed.
Data is cached for 2 minutes due to the real-time nature of market information.

## Import

```typescript
import { useCoinsMarkets } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinsMarkets(
  params: MarketParams,
  options?: CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `MarketParams`
- **Required**: Yes
- **Description**: - Market data query parameters including currency and filtering options

### options

- **Type**: `CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Infinite Query result with paginated market data, loading state, and error info

## Usage

```typescript
import { useCoinsMarkets } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinsMarkets(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic market data with infinite scroll

```typescript
function MarketTable() {
const {
data,
fetchNextPage,
hasNextPage,
isFetchingNextPage,
isLoading,
} = useCoinsMarkets({ vs_currency: 'usd', per_page: 50 });

if (isLoading) return <div>Loading market data...</div>;

const allCoins = data?.pages?.flat() || [];

return (
<div>
<h2>Cryptocurrency Market</h2>
<table>
<thead>
 <tr>
   <th>Rank</th>
   <th>Name</th>
   <th>Price</th>
   <th>24h Change</th>
   <th>Market Cap</th>
 </tr>
</thead>
<tbody>
 {allCoins.map(coin => (
   <tr key={coin.id}>
     <td>#{coin.market_cap_rank}</td>
     <td>
       <img src={coin.image} alt={coin.name} width={24} />
       {coin.name} ({coin.symbol.toUpperCase()})
     </td>
     <td>${coin.current_price?.toFixed(2)}</td>
     <td className={coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}>
       {coin.price_change_percentage_24h?.toFixed(2)}%
     </td>
     <td>${coin.market_cap?.toLocaleString()}</td>
   </tr>
 ))}
</tbody>
</table>
{hasNextPage && (
<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
 {isFetchingNextPage ? 'Loading more...' : 'Load More'}
</button>
)}
</div>
);
}
```

### Example 2

Filtered market data by category

```typescript
function DeFiCoins() {
const { data, isLoading } = useCoinsMarkets({
vs_currency: 'usd',
category: 'decentralized-finance-defi',
order: 'market_cap_desc',
per_page: 20,
sparkline: true,
price_change_percentage: '1h,24h,7d'
});

if (isLoading) return <div>Loading DeFi coins...</div>;

const defiCoins = data?.pages?.[0] || [];

return (
<div>
<h2>Top DeFi Coins</h2>
{defiCoins.map(coin => (
<div key={coin.id}>
 <h3>{coin.name}</h3>
 <p>Price: ${coin.current_price}</p>
 <p>24h: {coin.price_change_percentage_24h?.toFixed(2)}%</p>
 {coin.sparkline_in_7d && (
   <div>Sparkline data available for charting</div>
 )}
</div>
))}
</div>
);
}
```
