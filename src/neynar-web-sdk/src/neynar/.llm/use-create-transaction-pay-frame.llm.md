# useCreateTransactionPayFrame

**Type**: hook

Creates a transaction pay frame that can be used to collect payments through Farcaster

Enables secure blockchain payment flows directly within Farcaster frames with full
transparency of transaction details and costs.

**Special Behaviors:**

- API enforces `transaction.to.amount > 0` (returns error if not met)
- API requires `config.line_items` to have at least one item
- Idempotency key (`idem`) prevents duplicate frame creation on retries

## Import

```typescript
import { useCreateTransactionPayFrame } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useCreateTransactionPayFrame(
  options?: ExtendedMutationOptions<
    TransactionFrameResponse,
    UseCreateTransactionPayFrameParams
  >,
): MutationHookResult<
  TransactionFrameResponse,
  UseCreateTransactionPayFrameParams
>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  TransactionFrameResponse,
  UseCreateTransactionPayFrameParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<
  TransactionFrameResponse,
  UseCreateTransactionPayFrameParams
>;
```

TanStack Query mutation result

- `mutate: (params:` UseCreateTransactionPayFrameParams`) => void` - Trigger frame creation

## Usage

```typescript
import { useCreateTransactionPayFrame } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useCreateTransactionPayFrame(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic USDC payment on Base

```tsx
function CreatePaymentFrame() {
  const createFrame = useCreateTransactionPayFrame({
    onSuccess: (response) => {
      console.log("Frame URL:", response.transaction_frame.url);
    },
  });

  const handleCreate = () => {
    createFrame.mutate({
      transaction: {
        to: {
          address: "0x8E9bFa938E3631B9351A83DdA88C1f89d79E7585",
          network: "base",
          token_contract_address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          amount: 10.5,
        },
      },
      config: {
        line_items: [
          {
            name: "Premium Subscription",
            description: "Monthly premium access",
            image: "https://example.com/image.png",
          },
        ],
      },
      idem: "sub-payment-123",
    });
  };

  return (
    <button onClick={handleCreate} disabled={createFrame.isPending}>
      {createFrame.isPending ? "Creating..." : "Create Payment"}
    </button>
  );
}
```
