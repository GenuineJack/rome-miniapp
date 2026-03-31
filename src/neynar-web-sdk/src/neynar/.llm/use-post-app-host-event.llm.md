# usePostAppHostEvent

**Type**: hook

Post an app host event to the domain's webhook

Submits app lifecycle events (frame install/removal, notification enable/disable) to the
configured webhook endpoint for the mini app domain. Supports two authentication methods:
custom-signed messages for advanced use cases, or Neynar-managed signers for simplified
integration. Essential for tracking user engagement and managing notification preferences.

**Mutation Parameters:**

Pass parameters as the argument to `mutate()`. This is a union type - provide EITHER option 1 (signed_message) OR option 2 (signer_uuid):

**Option 1: Using signed_message**

- `signed_message` - JFS-signed message containing the event payload (can be string or object with header/payload/signature)
- `app_domain` - Domain of the mini app

**Option 2: Using signer_uuid**

- `signer_uuid` - UUID of the signer (paired with API key)
- `app_domain` - Domain of the mini app
- `fid` - The unique identifier of a farcaster user or app
- `event` - Event type: `"frame_added"` | `"frame_removed"` | `"notifications_enabled"` | `"notifications_disabled"`

## Import

```typescript
import { usePostAppHostEvent } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePostAppHostEvent(
  options?: ExtendedMutationOptions<
    AppHostPostEventResponse,
    AppHostPostEventReqBody
  >,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  AppHostPostEventResponse,
  AppHostPostEventReqBody
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query mutation result

- `mutate: (params:` AppHostPostEventReqBody`) => void` - Trigger event post

## Usage

```typescript
import { usePostAppHostEvent } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePostAppHostEvent(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Enable notifications for user

```tsx
function EnableNotificationsButton({
  appDomain,
  fid,
  signerUuid,
}: {
  appDomain: string;
  fid: number;
  signerUuid: string;
}) {
  const postEvent = usePostAppHostEvent({
    onSuccess: (data) => {
      console.log("Notifications enabled:", data.success);
      alert("Notifications enabled successfully!");
    },
    onError: (error) => {
      console.error("Failed to enable notifications:", error);
      alert(`Error: ${error.message}`);
    },
  });

  const handleEnable = () => {
    postEvent.mutate({
      signer_uuid: signerUuid,
      app_domain: appDomain,
      event: "notifications_enabled",
      fid,
    });
  };

  return (
    <button onClick={handleEnable} disabled={postEvent.isPending}>
      {postEvent.isPending ? "Enabling..." : "Enable Notifications"}
    </button>
  );
}
```
