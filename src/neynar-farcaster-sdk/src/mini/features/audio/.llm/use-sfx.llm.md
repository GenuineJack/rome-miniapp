# useSfx

**Type**: hook

No description available

## Import

```typescript
import { useSfx } from "@/neynar-farcaster-sdk/audio";
```

## Hook Signature

```typescript
function useSfx(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

## Usage

```typescript
import { useSfx } from '@/neynar-farcaster-sdk/audio';

function MyComponent() {
  const result = useSfx();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```
