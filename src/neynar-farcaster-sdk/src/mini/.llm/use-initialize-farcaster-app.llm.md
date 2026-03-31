# useInitializeFarcasterApp

**Type**: hook

Initialize Farcaster SDK and populate user atoms

Call this hook once at the app root level (in your main App component).

Handles:

- SDK initialization (sdk.actions.ready())
- Back button setup (if creator context)
- User context loading from Farcaster SDK
- Error handling for guest users

## Import

```typescript
import { useInitializeFarcasterApp } from "@/neynar-farcaster-sdk/mini";
```

## Hook Signature

```typescript
function useInitializeFarcasterApp(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

## Usage

```typescript
import { useInitializeFarcasterApp } from '@/neynar-farcaster-sdk/mini';

function MyComponent() {
  const result = useInitializeFarcasterApp();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function App() {
  useInitializeFarcasterApp();

  return <YourApp />;
}
```
