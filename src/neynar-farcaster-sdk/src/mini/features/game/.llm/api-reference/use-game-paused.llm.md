# useGamePaused

**Type**: hook

Check if game is paused

Returns the current pause state of the game.

## Import

```typescript
import { useGamePaused } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGamePaused(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

True if game is paused

## Usage

```typescript
import { useGamePaused } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGamePaused();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const isPaused = useGamePaused();
return <div>{isPaused ? "PAUSED" : "PLAYING"}</div>;
```
