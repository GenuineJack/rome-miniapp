# useBuyStorage

**Type**: hook

Rent storage units for a user for one year

**Special Behaviors:**

- Storage is rented for one year from purchase date
- Idempotency: Use the `idem` parameter with the same value on retry attempts to prevent duplicate purchases
- Returns updated storage allocations after successful purchase

## Import

```typescript
import { useBuyStorage } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useBuyStorage(
  options?: ExtendedMutationOptions<
    StorageAllocationsResponse,
    UseBuyStorageParams
  >,
): MutationHookResult<StorageAllocationsResponse, UseBuyStorageParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  StorageAllocationsResponse,
  UseBuyStorageParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<StorageAllocationsResponse, UseBuyStorageParams>;
```

TanStack Query mutation result

- `mutate: (params: UseBuyStorageParams) => void` - Trigger storage purchase

## Usage

```typescript
import { useBuyStorage } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useBuyStorage(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic storage purchase

```tsx
function BuyStorageButton({ fid }: { fid: number }) {
  const buyStorage = useBuyStorage({
    onSuccess: (data) => {
      console.log("New total units:", data.total_active_units);
    },
  });

  const handleBuy = () => {
    buyStorage.mutate({
      fid,
      units: 1,
      idem: crypto.randomUUID(), // Recommended: 16-char unique string
    });
  };

  return (
    <button onClick={handleBuy} disabled={buyStorage.isPending}>
      {buyStorage.isPending ? "Purchasing..." : "Buy Storage Unit"}
    </button>
  );
}
```
