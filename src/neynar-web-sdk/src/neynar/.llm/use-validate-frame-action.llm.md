# useValidateFrameAction

**Type**: hook

Validate frame action

Validates a frame action without executing it. Useful for testing frame
interactions, debugging frame implementations, and ensuring frame URLs
conform to the Frames specification.

## Import

```typescript
import { useValidateFrameAction } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useValidateFrameAction(
  options?: ExtendedMutationOptions<
    ValidateFrameActionResponse,
    UseValidateFrameActionParams
  >,
): MutationHookResult<
  ValidateFrameActionResponse,
  UseValidateFrameActionParams
>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<
  ValidateFrameActionResponse,
  UseValidateFrameActionParams
  > `
- **Required**: No
- **Description**: - Mutation options including params and callbacks

## Returns

```typescript
MutationHookResult<ValidateFrameActionResponse, UseValidateFrameActionParams>;
```

TanStack Query mutation result with mutate function and state

## Usage

```typescript
import { useValidateFrameAction } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useValidateFrameAction(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Frame validation

```tsx
const validateFrameAction = useValidateFrameAction({
  onSuccess: (result) => {
    console.log("Frame action is valid:", result);
  },
});

const handleValidation = () => {
  validateFrameAction.mutate({
    url: "https://example.com/frame",
    postUrl: "https://example.com/frame/action",
  });
};
```
