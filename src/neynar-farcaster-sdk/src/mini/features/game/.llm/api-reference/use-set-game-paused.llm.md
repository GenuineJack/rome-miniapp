# useSetGamePaused

**Type**: hook

Set game pause state

Pause or resume the game. This is just state management - you need to
implement the actual pause logic (stopping game loop, etc).

## Import

```typescript
import { useSetGamePaused } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetGamePaused(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function that accepts a boolean

## Usage

```typescript
import { useSetGamePaused } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetGamePaused();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const setIsPaused = useSetGamePaused();

function togglePause() {
  setIsPaused((prev) => !prev);
}
```
