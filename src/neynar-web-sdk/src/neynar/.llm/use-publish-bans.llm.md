# usePublishBans

**Type**: hook

Bans a list of FIDs from the app associated with your API key

Banned users, their casts and reactions will not appear in feeds.

## Import

```typescript
import { usePublishBans } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishBans(
  options?: ExtendedMutationOptions<BanResponse, PublishBansParams>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<BanResponse, PublishBansParams>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params:` PublishBansParams`) => void` - Trigger ban operation

## Usage

```typescript
import { usePublishBans } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishBans(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function BanButton({ fid }: { fid: number }) {
  const banMutation = usePublishBans({
    onSuccess: () => console.log("User banned"),
  });

  return (
    <button
      onClick={() => banMutation.mutate({ fids: [fid] })}
      disabled={banMutation.isPending}
    >
      {banMutation.isPending ? "Banning..." : "Ban User"}
    </button>
  );
}
```
