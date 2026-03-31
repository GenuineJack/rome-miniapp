# useSetActiveGameActions

**Type**: hook

Set the active game actions

Updates which keys/buttons are currently pressed.
Typically used internally by useInitializeGame.

## Import

```typescript
import { useSetActiveGameActions } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetActiveGameActions(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function that accepts a Set or updater function

## Usage

```typescript
import { useSetActiveGameActions } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetActiveGameActions();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const setActiveKeys = useSetActiveGameActions();
setActiveKeys((prev) => new Set(prev).add("jump"));
```
