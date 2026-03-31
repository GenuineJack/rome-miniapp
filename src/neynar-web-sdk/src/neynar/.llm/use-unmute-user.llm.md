# useUnmuteUser

**Type**: hook

Deletes a mute for a given FID

**IMPORTANT**: This is an allowlisted API. Reach out to Neynar if you need access.

When a user is unmuted, their posts will start appearing again in the unmuting
user's feeds and notifications. Automatically invalidates mute lists, feeds,
and user queries to update UI.

## Import

```typescript
import { useUnmuteUser } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUnmuteUser(
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

- `mutate: (params:` MuteReqBody`) => void` - Trigger unmute action
  **Mutation Parameters** (passed to `mutate()`):
- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)
- `muted_fid: number` - The unique identifier of a farcaster user or app (unsigned integer)

## Usage

```typescript
import { useUnmuteUser } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUnmuteUser(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function UnmuteButton({ targetFid, fid }: { targetFid: number; fid: number }) {
  const unmuteMutation = useUnmuteUser({
    onSuccess: (data) => {
      console.log("Successfully unmuted user!", data);
    },
    onError: (error) => {
      console.error("Failed to unmute user:", error);
    },
  });

  return (
    <button
      onClick={() => unmuteMutation.mutate({ fid, muted_fid: targetFid })}
      disabled={unmuteMutation.isPending}
    >
      {unmuteMutation.isPending ? "Unmuting..." : "Unmute User"}
    </button>
  );
}
```
