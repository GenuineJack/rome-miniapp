# useLocalStorageState

**Type**: hook

State that persists to localStorage

Works exactly like useState but syncs to localStorage automatically.
Uses Jotai's atomWithStorage internally with namespaced keys.

## Recommended Pattern: Wrap in a Domain-Specific Hook

Instead of using this hook directly, wrap it in a feature-specific hook:

```typescript
// src/features/game/use-high-score.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";

export function useHighScore() {
  return useLocalStorageState<number>("high-score", 0);
}

// In your component
const [highScore, setHighScore] = useHighScore();
if (score > highScore) {
  setHighScore(score); // Automatically saves to localStorage
}
```

**Benefits:**

- Storage key defined once
- Type enforced automatically
- Clear, focused hook for specific use case
- Easy to mock in tests

## Import

```typescript
import { useLocalStorageState } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useLocalStorageState(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void];
```

## Parameters

### key

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### initialValue

- **Type**: `T`
- **Required**: Yes
- **Description**: No description available

## Returns

```typescript
[T, (value: T | ((prev: T) => T)) => void]
```

Tuple of [value, setValue] like useState

## Usage

```typescript
import { useLocalStorageState } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useLocalStorageState("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Direct usage (not recommended for production)

```typescript
// Persistent high score
const [highScore, setHighScore] = useLocalStorageState("high-score", 0);
if (score > highScore) {
  setHighScore(score); // Automatically saves to localStorage
}

// Persistent settings
const [settings, setSettings] = useLocalStorageState("settings", {
  volume: 0.5,
  difficulty: "normal",
});

// Works with any type
const [level, setLevel] = useLocalStorageState("current-level", 1);
const [unlocked, setUnlocked] = useLocalStorageState<string[]>(
  "unlocked-items",
  [],
);
```
