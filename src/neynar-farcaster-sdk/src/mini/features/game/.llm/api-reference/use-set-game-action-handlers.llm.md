# useSetGameActionHandlers

**Type**: hook

Set game action handlers

Store handlers globally. This is used internally by useInitializeGame.
You should NOT need to call this directly in your game code.

## Import

```typescript
import { useSetGameActionHandlers } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetGameActionHandlers(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function for handlers object

## Usage

```typescript
import { useSetGameActionHandlers } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetGameActionHandlers();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```
