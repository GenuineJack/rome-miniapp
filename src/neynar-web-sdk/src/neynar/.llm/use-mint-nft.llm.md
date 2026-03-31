# useMintNft

**Type**: hook

Mint NFT mutation hook

Provides a mutation function to mint NFTs to a specified recipient.
Supports minting to users by FID or wallet address with custom metadata.
Returns a TanStack Query mutation with loading states and minting results.

## Import

```typescript
import { useMintNft } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useMintNft(
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

- `mutate: (params: MintNftRequest) => void`

## Usage

```typescript
import { useMintNft } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useMintNft(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

NFT minting with attributes

```tsx
function MintNFTForm({
  signerUuid,
  contractAddress,
}: {
  signerUuid: string;
  contractAddress: string;
}) {
  const [nftData, setNftData] = useState({
    recipient_fid: 0,
    name: "",
    description: "",
    image: "",
    quantity: 1,
  });

  const mintMutation = useMintNft({
    onSuccess: (data) => {
      console.log("NFT minted!", data.token_ids);
      console.log("Transaction:", data.transaction_hash);
    },
    onError: (error) => {
      console.error("Minting failed:", error);
    },
  });

  const handleMint = () => {
    mintMutation.mutate({
      signer_uuid: signerUuid,
      contract_address: contractAddress,
      recipient_fid: nftData.recipient_fid,
      metadata: {
        name: nftData.name,
        description: nftData.description,
        image: nftData.image,
        attributes: [
          { trait_type: "Rarity", value: "Common" },
          { trait_type: "Power", value: 100 },
        ],
      },
      quantity: nftData.quantity,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleMint();
      }}
    >
      <input
        type="number"
        value={nftData.recipient_fid}
        onChange={(e) =>
          setNftData({ ...nftData, recipient_fid: parseInt(e.target.value) })
        }
        placeholder="Recipient FID"
      />
      <input
        value={nftData.name}
        onChange={(e) => setNftData({ ...nftData, name: e.target.value })}
        placeholder="NFT Name"
      />
      <input
        value={nftData.image}
        onChange={(e) => setNftData({ ...nftData, image: e.target.value })}
        placeholder="Image URL"
      />
      <button type="submit" disabled={mintMutation.isPending}>
        {mintMutation.isPending ? "Minting..." : "Mint NFT"}
      </button>
    </form>
  );
}
```
