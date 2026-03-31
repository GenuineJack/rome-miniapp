# useSetGameLoading

**Type**: hook

Set game loading state

Indicate loading status for assets, level data, etc.

## Import

```typescript
import { useSetGameLoading } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useSetGameLoading(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Setter function that accepts a boolean

## Usage

```typescript
import { useSetGameLoading } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useSetGameLoading();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const setIsLoading = useSetGameLoading();

async function loadLevel() {
  setIsLoading(true);
  await fetchLevelData();
  setIsLoading(false);
}
```
