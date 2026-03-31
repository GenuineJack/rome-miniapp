# useTokenPrice

**Type**: hook

Fetches current price data for tokens by their contract addresses on specific blockchain networks

This hook enables price lookups for any ERC-20 token or equivalent on supported blockchain networks
using contract addresses instead of CoinGecko coin IDs. Essential for DeFi applications, DEX interfaces,
and any application dealing with tokens that may not have established CoinGecko listings.

Supports all major blockchain networks including Ethereum, Polygon, Binance Smart Chain, Avalanche,
and many others. The hook automatically handles network-specific contract address formatting and
provides the same market data options as the main price endpoint.

## Import

```typescript
import { useTokenPrice } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useTokenPrice(
  network: string,
  contractAddresses: string[],
  vsCurrencies: string[],
  options?: SimplePriceOptions,
  queryOptions?: ExtendedQueryOptions<SimplePriceData> & CoinGeckoHookOptions,
): UseQueryResult<SimplePriceData, ApiError>;
```

## Parameters

### network

- **Type**: `string`
- **Required**: Yes
- **Description**: - Blockchain network identifier (e.g., 'ethereum', 'polygon-pos', 'binance-smart-chain')

### contractAddresses

- **Type**: `string[]`
- **Required**: Yes
- **Description**: - Array of contract addresses to fetch prices for

### vsCurrencies

- **Type**: `string[]`
- **Required**: Yes
- **Description**: - Array of target currencies for price conversion (e.g., ['usd', 'eur', 'btc'])

### options

- **Type**: `SimplePriceOptions`
- **Required**: No
- **Description**: Additional query parameters

**options properties:**

- `includeMarketCap?: boolean` - - Include market capitalization data for each token
- `include24hrVol?: boolean` - - Include 24-hour trading volume data
- `include24hrChange?: boolean` - - Include 24-hour percentage change data
- `includeLastUpdatedAt?: boolean` - - Include timestamp of last price update
- `precision?: string` - - Control decimal precision of returned prices

### queryOptions

- **Type**: `ExtendedQueryOptions<SimplePriceData> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
UseQueryResult<SimplePriceData, ApiError>;
```

TanStack Query result with price data indexed by contract address

## Usage

```typescript
import { useTokenPrice } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useTokenPrice("example", "example", "example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
// Fetch prices for specific ERC-20 tokens on Ethereum
const { data: tokenPrices, isLoading } = useTokenPrice(
  "ethereum",
  [
    "0xA0b86a33E6441d0C3F0dD3a4D1dE8Ff5e0B8dE8A", // Example USDC contract
    "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", // Example SUSHI contract
  ],
  ["usd", "eth"],
  {
    includeMarketCap: true,
    include24hrChange: true,
  },
  {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // 30 second stale time
  },
);

// Access token prices by contract address:
const usdcPrice =
  tokenPrices?.["0xa0b86a33e6441d0c3f0dd3a4d1de8ff5e0b8de8a"]?.usd;
const sushiPrice =
  tokenPrices?.["0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"]?.usd;
```

### Example 2

```typescript
// Multi-chain token price tracking
const ethereumTokens = ["0x...", "0x..."];
const polygonTokens = ["0x...", "0x..."];

const { data: ethPrices } = useTokenPrice("ethereum", ethereumTokens, ["usd"]);
const { data: polygonPrices } = useTokenPrice("polygon-pos", polygonTokens, [
  "usd",
]);

// Combine prices for portfolio calculation
const totalValue = [
  ...Object.values(ethPrices || {}),
  ...Object.values(polygonPrices || {}),
].reduce((sum, tokenData) => sum + (tokenData?.usd || 0), 0);
```

### Example 3

```typescript
// DEX interface price display
const DexTokenPrice = ({ contractAddress, network }: TokenPriceProps) => {
  const { data: tokenPrice, isLoading } = useTokenPrice(
    network,
    [contractAddress],
    ['usd', 'eth'],
    {
      include24hrChange: true,
      precision: '6'
    }
  );

  const price = tokenPrice?.[contractAddress.toLowerCase()];
  const priceChange = price?.usd_24h_change || 0;
  const isPositive = priceChange > 0;

  if (isLoading) return <div>Loading price...</div>;

  return (
    <div className="token-price">
      <div className="price">${price?.usd?.toFixed(6)}</div>
      <div className={`change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
      </div>
    </div>
  );
};
```
