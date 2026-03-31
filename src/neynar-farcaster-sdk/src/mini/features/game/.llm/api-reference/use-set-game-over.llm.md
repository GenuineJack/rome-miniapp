# useSetGameOver

**Type**: hook

Set game over state

Mark the game as finished. Useful for triggering game over UI,
disabling controls, showing scores, etc.

## Import

```typescript
import { useSetGameOver } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetGameOver(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function that accepts a boolean

## Usage

```typescript
import { useSetGameOver } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetGameOver();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const setIsGameOver = useSetGameOver();

function handlePlayerDeath() {
  setIsGameOver(true);
  showDeathAnimation();
}
```
