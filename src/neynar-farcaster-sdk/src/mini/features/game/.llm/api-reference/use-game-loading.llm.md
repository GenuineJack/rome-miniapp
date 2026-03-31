# useGameLoading

**Type**: hook

Check if game is loading

Returns whether the game is in a loading state.

## Import

```typescript
import { useGameLoading } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGameLoading(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

True if game is loading

## Usage

```typescript
import { useGameLoading } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGameLoading();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const isLoading = useGameLoading();
if (isLoading) {
  return <LoadingSpinner />;
}
```
