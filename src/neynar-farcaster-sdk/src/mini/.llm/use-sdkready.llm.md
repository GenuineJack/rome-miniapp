# useSDKReady

**Type**: hook

Hook to check if Farcaster SDK is ready

## Import

```typescript
import { useSDKReady } from "@/neynar-farcaster-sdk/mini";
```

## Hook Signature

```typescript
function useSDKReady(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

## Usage

```typescript
import { useSDKReady } from '@/neynar-farcaster-sdk/mini';

function MyComponent() {
  const result = useSDKReady();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```
