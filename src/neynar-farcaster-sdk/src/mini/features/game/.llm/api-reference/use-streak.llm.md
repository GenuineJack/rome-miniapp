# useStreak

**Type**: hook

Win streak tracking hook (global)

Tracks current win streak and best streak ever achieved using Jotai atoms.
Wins increment the streak, losses reset it to 0.

## Import

```typescript
import { useStreak } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useStreak(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with streak values and manipulation functions

## Usage

```typescript
import { useStreak } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useStreak();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { streak, bestStreak, addWin, addLoss, resetStreak } = useStreak();

// Player wins a round
if (playerWon) {
  addWin(); // streak increments
} else {
  addLoss(); // streak resets to 0, bestStreak preserved
}

// Display: "Current: {streak} | Best: {bestStreak}"

// Reset everything
resetStreak(); // Both streak and bestStreak become 0
```
