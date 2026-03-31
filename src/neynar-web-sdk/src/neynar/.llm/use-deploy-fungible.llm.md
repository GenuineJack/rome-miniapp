# useDeployFungible

**Type**: hook

Deploy fungible token mutation hook

Provides a mutation function to deploy a new fungible token contract on-chain.
Returns a TanStack Query mutation with loading states and error handling.
Automatically invalidates relevant token queries upon success.

## Import

```typescript
import { useDeployFungible } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useDeployFungible(
  options?: BaseMutationOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `BaseMutationOptions`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result with mutate function and state

- `mutate: (params: DeployFungibleRequest) => void`

## Usage

```typescript
import { useDeployFungible } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useDeployFungible(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic token deployment

```tsx
function CreateTokenForm({ signerUuid }: { signerUuid: string }) {
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    total_supply: "1000000",
  });

  const deployMutation = useDeployFungible({
    onSuccess: (data) => {
      console.log("Token deployed!", data.contract_address);
    },
    onError: (error) => {
      console.error("Deployment failed:", error);
    },
  });

  const handleDeploy = () => {
    deployMutation.mutate({
      signer_uuid: signerUuid,
      name: tokenData.name,
      symbol: tokenData.symbol,
      total_supply: tokenData.total_supply,
      decimals: 18,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleDeploy();
      }}
    >
      <input
        value={tokenData.name}
        onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
        placeholder="Token Name"
      />
      <input
        value={tokenData.symbol}
        onChange={(e) => setTokenData({ ...tokenData, symbol: e.target.value })}
        placeholder="Token Symbol"
      />
      <button type="submit" disabled={deployMutation.isPending}>
        {deployMutation.isPending ? "Deploying..." : "Deploy Token"}
      </button>
    </form>
  );
}
```
