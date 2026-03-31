# useScore

**Type**: hook

Global score management hook using Jotai atoms

Manages score state globally with helper functions to manipulate the score.
Score is shared across all components that use this hook.
Reads allowNegativeScore config from gameConfigAtom (set via useInitializeGame).

## Import

```typescript
import { useScore } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useScore(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with score value and manipulation functions

## Usage

```typescript
import { useScore } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useScore();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
// Initialize game config first
useInitializeGame({
  config: { allowNegativeScore: true },
  actions: { ... }
});

// Then use score hook
const { score, addScore, subtractScore, setScore, resetScore } = useScore();

// Player collects coin
addScore(10);

// Player gets bonus
addScore(100);

// Player takes damage penalty
subtractScore(25);

// With allowNegativeScore: false (default)
subtractScore(1000); // Score becomes 0, not negative

// With allowNegativeScore: true
subtractScore(1000); // Score can go negative (e.g., -900)

// Set score directly
setScore(500);

// Reset to zero
resetScore();
```
