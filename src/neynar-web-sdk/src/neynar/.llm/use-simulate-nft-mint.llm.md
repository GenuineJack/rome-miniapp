# useSimulateNftMint

**Type**: hook

Simulate NFT mint mutation hook

Provides a mutation function to simulate NFT minting without actually executing
the transaction. This is useful for estimating gas costs, validating parameters,
and ensuring the mint will succeed before committing to the transaction.

## Import

```typescript
import { useSimulateNftMint } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSimulateNftMint(
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

TanStack Query mutation result with mutate function and simulation results

- `mutate: (params: SimulateNftMintRequest) => void`

## Usage

```typescript
import { useSimulateNftMint } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSimulateNftMint(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Mint simulation with cost preview

```tsx
function NFTMintSimulator({ contractAddress }: { contractAddress: string }) {
  const [simulationData, setSimulationData] = useState({
    recipient_address: "",
    name: "",
    image: "",
    quantity: 1,
  });

  const simulateMutation = useSimulateNftMint({
    onSuccess: (data) => {
      console.log("Simulation successful!");
      console.log("Estimated gas:", data.estimated_gas);
      console.log("Total cost:", data.total_cost);
    },
    onError: (error) => {
      console.error("Simulation failed:", error);
    },
  });

  const handleSimulate = () => {
    simulateMutation.mutate({
      contract_address: contractAddress,
      recipient_address: simulationData.recipient_address,
      metadata: {
        name: simulationData.name,
        image: simulationData.image,
      },
      quantity: simulationData.quantity,
    });
  };

  return (
    <div>
      <h3>Simulate NFT Mint</h3>
      <input
        value={simulationData.recipient_address}
        onChange={(e) =>
          setSimulationData({
            ...simulationData,
            recipient_address: e.target.value,
          })
        }
        placeholder="Recipient Address"
      />
      <button onClick={handleSimulate} disabled={simulateMutation.isPending}>
        {simulateMutation.isPending ? "Simulating..." : "Simulate Mint"}
      </button>

      {simulateMutation.data && (
        <div>
          <h4>Simulation Results</h4>
          <p>Estimated Gas: {simulateMutation.data.estimated_gas}</p>
          <p>Gas Price: {simulateMutation.data.gas_price}</p>
          <p>Total Cost: {simulateMutation.data.total_cost}</p>
          {simulateMutation.data.errors?.map((error, index) => (
            <p key={index} style={{ color: "red" }}>
              Error: {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
```
