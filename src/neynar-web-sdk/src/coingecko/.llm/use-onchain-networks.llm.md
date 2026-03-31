# useOnchainNetworks

**Type**: hook

Fetches supported blockchain networks for onchain data queries

This hook provides comprehensive information about all blockchain networks
supported by CoinGecko's onchain API, including network identifiers, native
tokens, pool counts, and volume metrics. Essential for network selection
and cross-chain analysis. Data is cached for 24 hours as network info changes infrequently.

## Import

```typescript
import { useOnchainNetworks } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useOnchainNetworks(
  params?: OnchainNetworksParams,
  options?: ExtendedQueryOptions<OnchainNetwork[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `OnchainNetworksParams`
- **Required**: No
- **Description**: - Optional pagination parameters

### options

- **Type**: `ExtendedQueryOptions<OnchainNetwork[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Optional query configuration parameters

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

UseQueryResult containing:

- `data.data[]`: Array of OnchainNetwork objects with network details
- Each network includes: id, name, shortname, chain_identifier, native_coin_id, image, pool_count, total_volume_24h

## Usage

```typescript
import { useOnchainNetworks } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useOnchainNetworks(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function NetworkSelector() {
  const { data, isLoading } = useOnchainNetworks();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  if (isLoading) return <div>Loading networks...</div>;

  const networks = data?.data || [];
  const totalNetworks = networks.length;
  const totalPools = networks.reduce(
    (sum, net) => sum + (net.pool_count || 0),
    0,
  );

  return (
    <div>
      <h2>Supported Networks ({totalNetworks})</h2>
      <p>Total Pools: {totalPools.toLocaleString()}</p>

      <div className="network-grid">
        {networks.map((network) => (
          <button
            key={network.id}
            onClick={() => setSelectedNetwork(network.id)}
            className={`network-card ${selectedNetwork === network.id ? "selected" : ""}`}
          >
            {network.image?.thumb && (
              <img src={network.image.thumb} alt={network.name} />
            )}
            <h3>{network.name}</h3>
            <p>
              {network.shortname} (Chain ID: {network.chain_identifier})
            </p>
            <div className="stats">
              <span>Pools: {network.pool_count?.toLocaleString()}</span>
              <span>
                24h Volume: ${network.total_volume_24h?.toLocaleString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```
