# useGameControlsEnabled

**Type**: hook

Check if game controls are enabled

Returns whether keyboard and touch controls are currently active.
When false, useInitializeGame will not respond to input.

## Import

```typescript
import { useGameControlsEnabled } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGameControlsEnabled(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

True if controls are enabled

## Usage

```typescript
import { useGameControlsEnabled } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGameControlsEnabled();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const isEnabled = useGameControlsEnabled();
if (!isEnabled) {
  return <div>Controls disabled</div>;
}
```
