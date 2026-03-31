# useGameActionHandlers

**Type**: hook

Get game action handlers

Returns the globally stored handlers created by useInitializeGame.
Use this in child components to access button/key handlers.

## Import

```typescript
import { useGameActionHandlers } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGameActionHandlers(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object mapping GameAction to handler functions

## Usage

```typescript
import { useGameActionHandlers } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGameActionHandlers();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const handlers = useGameActionHandlers();
return <button onTouchStart={handlers.jump}>Jump</button>;
```
