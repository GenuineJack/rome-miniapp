# useActiveGameActions

**Type**: hook

Get the currently active game actions

Returns a Set of GameAction keys that are currently pressed.
Useful for visual feedback like highlighting active buttons.

## Import

```typescript
import { useActiveGameActions } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useActiveGameActions(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Set of active GameAction keys

## Usage

```typescript
import { useActiveGameActions } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useActiveGameActions();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const activeKeys = useActiveGameActions();
const isJumpActive = activeKeys.has("jump");
```
