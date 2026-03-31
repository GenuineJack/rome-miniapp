# usePublishFarcasterAction

**Type**: hook

Securely communicate and perform actions on behalf of users across different apps

Enables an app to send data or trigger actions in another app on behalf of a mutual user
by signing messages using the user's Farcaster signer. This is useful for cross-app
communication where apps need to interact with each other's APIs on behalf of shared users.

## Import

```typescript
import { usePublishFarcasterAction } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishFarcasterAction(
  options?: ExtendedMutationOptions<
    FarcasterActionResponse,
    UsePublishFarcasterActionParams
  >,
): MutationHookResult<FarcasterActionResponse, UsePublishFarcasterActionParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  FarcasterActionResponse,
  UsePublishFarcasterActionParams
  > `
- **Required**: No
- **Description**: - TanStack Query mutation options for callbacks and error handling

## Returns

```typescript
MutationHookResult<FarcasterActionResponse, UsePublishFarcasterActionParams>;
```

TanStack Query mutation result

- `mutate: (params:` UsePublishFarcasterActionParams`) => void` - Trigger action publish

## Usage

```typescript
import { usePublishFarcasterAction } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishFarcasterAction(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic action publishing

```tsx
function ActionPublisher({ signerUuid }: { signerUuid: string }) {
  const publishAction = usePublishFarcasterAction({
    onSuccess: (data) => {
      console.log("Action published successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to publish action:", error);
    },
  });

  const handleAction = () => {
    publishAction.mutate({
      signer_uuid: signerUuid,
      base_url: "https://myapp.com",
      action: {
        type: "message",
        payload: { message: "Hello from my app!" },
      },
    });
  };

  return (
    <button onClick={handleAction} disabled={publishAction.isPending}>
      {publishAction.isPending ? "Publishing..." : "Publish Action"}
    </button>
  );
}
```
