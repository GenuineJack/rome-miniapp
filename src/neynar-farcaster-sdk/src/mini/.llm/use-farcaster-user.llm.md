# useFarcasterUser

**Type**: hook

Hook to access Farcaster user state

## Import

```typescript
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
```

## Hook Signature

```typescript
function useFarcasterUser(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

## Usage

```typescript
import { useFarcasterUser } from '@/neynar-farcaster-sdk/mini';

function MyComponent() {
  const result = useFarcasterUser();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
const { data, isLoading, error } = useFarcasterUser();
const fid = data?.fid;
```
