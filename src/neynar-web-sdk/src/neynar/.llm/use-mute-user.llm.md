# useMuteUser

**Type**: hook

Adds a mute for a given FID

**IMPORTANT**: This is an allowlisted API. Reach out to Neynar if you need access.

When a user is muted, their posts will no longer appear in the muting user's feeds
and notifications. Automatically invalidates mute lists, feeds, and user queries to update UI.

## Import

```typescript
import { useMuteUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useMuteUser(
  options?: ExtendedMutationOptions<MuteResponse, MuteReqBody>,
): MutationHookResult<MuteResponse, MuteReqBody>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<MuteResponse, MuteReqBody>`
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<MuteResponse, MuteReqBody>;
```

TanStack Query mutation result

- `mutate: (params:` MuteReqBody`) => void` - Trigger mute action
  **Mutation Parameters** (passed to `mutate()`):
- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)
- `muted_fid: number` - The unique identifier of a farcaster user or app (unsigned integer)

## Usage

```typescript
import { useMuteUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useMuteUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function MuteButton({ targetFid, fid }: { targetFid: number; fid: number }) {
  const muteMutation = useMuteUser({
    onSuccess: (data) => {
      console.log("Successfully muted user!", data);
    },
    onError: (error) => {
      console.error("Failed to mute user:", error);
    },
  });

  return (
    <button
      onClick={() => muteMutation.mutate({ fid, muted_fid: targetFid })}
      disabled={muteMutation.isPending}
    >
      {muteMutation.isPending ? "Muting..." : "Mute User"}
    </button>
  );
}
```
