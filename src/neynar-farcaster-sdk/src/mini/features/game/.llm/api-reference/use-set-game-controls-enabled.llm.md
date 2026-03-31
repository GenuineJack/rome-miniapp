# useSetGameControlsEnabled

**Type**: hook

Enable or disable game controls

Use this to disable controls during animations, cutscenes, or loading.
Automatically integrates with useInitializeGame.

## Import

```typescript
import { useSetGameControlsEnabled } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetGameControlsEnabled(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function that accepts a boolean

## Usage

```typescript
import { useSetGameControlsEnabled } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetGameControlsEnabled();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const setControlsEnabled = useSetGameControlsEnabled();

// Disable during animation
useEffect(() => {
  if (isAnimating) {
    setControlsEnabled(false);
  } else {
    setControlsEnabled(true);
  }
}, [isAnimating, setControlsEnabled]);
```
