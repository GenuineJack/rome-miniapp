# useTransactionPayFrame

**Type**: hook

Retrieves details of a previously created transaction payment frame by its ID

## Import

```typescript
import { useTransactionPayFrame } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useTransactionPayFrame(
  params: UseTransactionPayFrameParams,
  options?: QueryHookOptions<TransactionFrameResponse, TransactionFrame>,
): QueryHookResult<TransactionFrame>;
```

## Parameters

### params

- **Type**: `UseTransactionPayFrameParams`
- **Required**: Yes
- **Description**: Additional query parameters (see properties below)

**params properties:**

- `id: string` - ID of the transaction frame to retrieve

**Required:** Yes
**Type:** string

### options

- **Type**: `QueryHookOptions<TransactionFrameResponse, TransactionFrame>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<TransactionFrame>;
```

TanStack Query result with transaction frame data

- `data:` `TransactionFrame` with:
  Transaction frame

Frame for executing blockchain transactions.

- `type:` TransactionFrameType - Type of transaction
- `status:` TransactionFrameStatus - Transaction status
- `config:` TransactionFrameConfig - Transaction configuration

**Referenced Types:**

**TransactionFrameConfig:**
Transaction frame config

Configuration for transaction frames.

- `'allowlist_fids'?: Array<number>` - Optional list of FIDs that are allowed to use this transaction mini app
- `'line_items': Array<TransactionFrameLineItem>` - List of items included in the transaction
- `'action'?: TransactionFrameAction` - No description available

**TransactionFrame:**
Transaction frame

Frame for executing blockchain transactions.

- `type:` TransactionFrameType - Type of transaction
- `status:` TransactionFrameStatus - Transaction status
- `config:` TransactionFrameConfig - Transaction configuration

## Usage

```typescript
import { useTransactionPayFrame } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useTransactionPayFrame(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic frame retrieval

```tsx
function PaymentFrameDetails({ frameId }: { frameId: string }) {
  const { data: frame, isLoading } = useTransactionPayFrame({ id: frameId });

  if (isLoading) return <div>Loading...</div>;
  if (!frame) return <div>Frame not found</div>;

  return (
    <div>
      <p>Status: {frame.status}</p>
      <p>Network: {frame.transaction.to.network}</p>
      <p>Amount: {frame.transaction.to.amount}</p>
      <a href={frame.url}>View Frame</a>
    </div>
  );
}
```
