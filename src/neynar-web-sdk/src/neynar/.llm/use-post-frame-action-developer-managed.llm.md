# usePostFrameActionDeveloperManaged

**Type**: hook

Post frame action (developer managed)

Submits a frame action for developer-managed frames, providing more control
over the frame action processing pipeline. This variant allows developers to
handle frame state and responses with custom logic rather than using Neynar's
default frame handling.

## Import

```typescript
import { usePostFrameActionDeveloperManaged } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePostFrameActionDeveloperManaged(
  options?: ExtendedMutationOptions<FrameAction, FrameActionParams>,
): MutationHookResult<FrameAction, FrameActionParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<FrameAction, FrameActionParams>`
- **Required**: No
- **Description**: - Additional mutation options for error handling and callbacks

## Returns

```typescript
MutationHookResult<FrameAction, FrameActionParams>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { usePostFrameActionDeveloperManaged } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePostFrameActionDeveloperManaged(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Developer-managed frame action

```tsx
const postDeveloperFrameAction = usePostFrameActionDeveloperManaged({
  onSuccess: (result) => {
    console.log("Developer frame action successful:", result);
  },
});
```
