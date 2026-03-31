# useInitializeGame

**Type**: hook

Initialize game configuration and action handlers

This hook combines game config initialization and action handler setup.
Call this once at the top level of your game component.

## Import

```typescript
import { useInitializeGame } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useInitializeGame(
  options?: UseInitializeGameParams,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `UseInitializeGameParams`
- **Required**: No
- **Description**: Additional query parameters (see properties below)

**options properties:**

- `allowNegativeScore?: boolean` - Allow score to go below 0
- `actions?: GameActionHandlers` - Map of actions to their handler config
  Each action can specify its own keys, handler, rateLimitMs, and allowRepeat

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

void

## Usage

```typescript
import { useInitializeGame } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useInitializeGame({ allowNegativeScore: true, actions: /* value */ });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
function PlayTab() {
  useInitializeGame({
    allowNegativeScore: true,
    actions: {
      // Standard action - uses default keys (Enter, e, E)
      action: {
        handler: () => addScore(10),
      },
      // Standard action with custom keys
      left: {
        keys: ["a", "A"], // Override default ArrowLeft
        handler: () => movePlayer("left"),
        allowRepeat: true,
      },
      // Standard action with config
      jump: {
        handler: () => playerJump(),
        allowRepeat: false, // Must release to jump again
      },
      // Custom action with custom keys
      shoot: {
        keys: ["Space", "f", "F"],
        handler: () => fireBullet(),
        rateLimitMs: 100, // Max 10 shots per second
      },
    },
  });

  // Now use other game hooks
  const { score } = useScore();
  // ...
}
```
