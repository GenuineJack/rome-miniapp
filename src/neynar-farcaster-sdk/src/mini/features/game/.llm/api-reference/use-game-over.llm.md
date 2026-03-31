# useGameOver

**Type**: hook

Check if game is over

Returns whether the game has ended (win or lose).

## Import

```typescript
import { useGameOver } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGameOver(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

True if game is over

## Usage

```typescript
import { useGameOver } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGameOver();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const isGameOver = useGameOver();
if (isGameOver) {
  return <GameOverScreen />;
}
```
