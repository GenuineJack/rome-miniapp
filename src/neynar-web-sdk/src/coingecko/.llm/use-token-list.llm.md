# useTokenList

**Type**: hook

Hook to fetch a complete token list for a specific blockchain platform.

This hook retrieves standardized ERC-20 token information including contract addresses,
symbols, names, decimals, and logo URIs for the specified asset platform.
Token lists are commonly used by DEXs and DeFi protocols for token discovery and verification.

**Rate Limits**: This endpoint is included in CoinGecko API rate limits
**Caching**: Data is cached for 24 hours as token lists are relatively stable
**Error Handling**: Failed requests are automatically retried with exponential backoff

## Import

```typescript
import { useTokenList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useTokenList(
  assetPlatformId: string,
  options?: ExtendedQueryOptions<TokenList> & CoinGeckoHookOptions,
): QueryHookResult<TokenList>;
```

## Parameters

### assetPlatformId

- **Type**: `string`
- **Required**: Yes
- **Description**: - The asset platform identifier (blockchain network)
  Common values: 'ethereum', 'polygon-pos', 'binance-smart-chain', 'avalanche',
  'arbitrum-one', 'optimistic-ethereum', 'fantom', 'xdai', 'harmony-shard-0'

### options

- **Type**: `ExtendedQueryOptions<TokenList> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Configuration options for query behavior and data fetching

## Returns

```typescript
QueryHookResult<TokenList>;
```

TanStack Query result containing comprehensive token list data

## Usage

```typescript
import { useTokenList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useTokenList("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
// Fetch Ethereum token list
function EthereumTokens() {
  const { data: tokenList, isLoading, error } = useTokenList('ethereum');

  if (isLoading) return <div>Loading token list...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{tokenList?.name}</h2>
      <p>Total tokens: {tokenList?.tokens?.length}</p>
      {tokenList?.tokens?.slice(0, 5).map(token => (
        <div key={token.address}>
          <strong>{token.symbol}</strong> - {token.name}
          <br />
          <code>{token.address}</code>
        </div>
      ))}
    </div>
  );
}
```

### Example 2

```typescript
// Fetch Polygon token list with custom cache time
function PolygonTokens() {
  const { data: tokenList } = useTokenList('polygon-pos', {
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    enabled: someCondition, // Conditional fetching
  });

  // Filter for USDC tokens
  const usdcTokens = tokenList?.tokens?.filter(
    token => token.symbol.includes('USDC')
  );

  return (
    <div>
      <h3>USDC variants on Polygon</h3>
      {usdcTokens?.map(token => (
        <div key={token.address}>
          {token.name} ({token.symbol}) - {token.decimals} decimals
        </div>
      ))}
    </div>
  );
}
```

### Example 3

```typescript
// Use with DeFi token selection
function TokenSelector({ onTokenSelect }: { onTokenSelect: (token: TokenListToken) => void }) {
  const { data: tokenList } = useTokenList('ethereum');

  return (
    <select onChange={(e) => {
      const token = tokenList?.tokens?.find(t => t.address === e.target.value);
      if (token) onTokenSelect(token);
    }}>
      <option value="">Select a token...</option>
      {tokenList?.tokens?.map(token => (
        <option key={token.address} value={token.address}>
          {token.name} ({token.symbol})
        </option>
      ))}
    </select>
  );
}
```
