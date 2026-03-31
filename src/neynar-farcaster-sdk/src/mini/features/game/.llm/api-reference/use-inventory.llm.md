# useInventory

**Type**: hook

Simple inventory system hook (global)

Stores collected items with deduplication by ID.
State is shared globally across all components that use this hook.

## Import

```typescript
import { useInventory } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useInventory(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with items array and management functions

## Usage

```typescript
import { useInventory } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useInventory();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const inventory = useInventory();

// Collect item
inventory.addItem({ id: "key" });

// Check if has item
if (inventory.hasItem("key")) {
  // Can unlock door
}
```
