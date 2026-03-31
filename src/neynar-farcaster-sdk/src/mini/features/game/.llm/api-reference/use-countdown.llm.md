# useCountdown

**Type**: hook

Countdown timer that counts down from a specified duration (global)

Automatically pauses when the game is paused via `useGamePaused()`.
Calls onComplete callback when timer reaches 0.
Must call start() to begin countdown (doesn't auto-start).
Uses Jotai atoms for global state.

## Import

```typescript
import { useCountdown } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useCountdown(
  seconds: number,
  options?: UseCountdownOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### seconds

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### options

- **Type**: `UseCountdownOptions`
- **Required**: No
- **Description**: No description available

**options properties:**

- `onComplete?: () => void` - No description available

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with timer state and control functions

## Usage

```typescript
import { useCountdown } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useCountdown(123, { onComplete: /* value */ });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { timeLeft, isRunning, start, pause, resume, reset } = useCountdown(60, {
  onComplete: () => alert("Time up!"),
});

// Start countdown
start();

// Display seconds: Math.ceil(timeLeft / 1000)
// Display MM:SS: Use Timer component

// Pause/resume
pause();
resume();

// Reset to initial time
reset();
```
