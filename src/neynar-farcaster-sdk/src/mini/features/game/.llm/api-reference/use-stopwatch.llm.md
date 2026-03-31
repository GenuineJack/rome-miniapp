# useStopwatch

**Type**: hook

Stopwatch timer that counts up from 0 (global)

Automatically pauses when the game is paused via `useGamePaused()`.
Must call start() to begin counting (doesn't auto-start).
Uses Jotai atoms for global state.

## Import

```typescript
import { useStopwatch } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useStopwatch(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with timer state and control functions

## Usage

```typescript
import { useStopwatch } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useStopwatch();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { elapsed, isRunning, start, pause, resume, reset } = useStopwatch();

// Start stopwatch on button click
start();

// Display seconds: (elapsed / 1000).toFixed(2) + 's'
// Display MM:SS: Use Timer component

// Pause/resume
pause();
resume();

// Reset to 0
reset();
```
