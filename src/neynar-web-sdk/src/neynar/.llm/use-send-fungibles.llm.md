# useSendFungibles

**Type**: hook

Send fungibles to users mutation hook

Provides a mutation function to transfer fungible tokens to multiple recipients.
Supports sending to users by FID or wallet address — the hook resolves FID to
wallet address internally. Returns a TanStack Query mutation with loading states
and detailed transfer results.

**Important:** This hook accepts `fid` in recipients and resolves it automatically.
If calling the raw Neynar API directly (e.g., via `fetch` in a server route), you
must provide `address` instead — see `TransactionSendFungiblesRecipient`.

## Import

```typescript
import { useSendFungibles } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSendFungibles(
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

- `mutate: (params: SendFungiblesRequest) => void`

## Usage

```typescript
import { useSendFungibles } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSendFungibles(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Batch token transfer

```tsx
function SendTokensForm({
  signerUuid,
  contractAddress,
}: {
  signerUuid: string;
  contractAddress: string;
}) {
  const [recipients, setRecipients] = useState([{ fid: 0, amount: "" }]);

  const sendMutation = useSendFungibles({
    onSuccess: (data) => {
      console.log(`Sent to ${data.successful_transfers} recipients`);
      if (data.failed_transfers?.length) {
        console.log("Some transfers failed:", data.failed_transfers);
      }
    },
    onError: (error) => {
      console.error("Transfer failed:", error);
    },
  });

  const handleSend = () => {
    sendMutation.mutate({
      signer_uuid: signerUuid,
      contract_address: contractAddress,
      recipients: recipients.filter((r) => r.fid > 0 && r.amount),
    });
  };

  return (
    <div>
      {recipients.map((recipient, index) => (
        <div key={index}>
          <input
            type="number"
            value={recipient.fid}
            onChange={(e) => {
              const newRecipients = [...recipients];
              newRecipients[index].fid = parseInt(e.target.value);
              setRecipients(newRecipients);
            }}
            placeholder="Recipient FID"
          />
          <input
            value={recipient.amount}
            onChange={(e) => {
              const newRecipients = [...recipients];
              newRecipients[index].amount = e.target.value;
              setRecipients(newRecipients);
            }}
            placeholder="Amount"
          />
        </div>
      ))}
      <button onClick={handleSend} disabled={sendMutation.isPending}>
        {sendMutation.isPending ? "Sending..." : "Send Tokens"}
      </button>
    </div>
  );
}
```
