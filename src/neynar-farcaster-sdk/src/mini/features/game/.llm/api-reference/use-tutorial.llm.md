# useTutorial

**Type**: hook

Multi-step tutorial system hook

Manages tutorial flow with navigation, progress tracking, and completion callbacks.

## Import

```typescript
import { useTutorial } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useTutorial(steps: TutorialStep[]): UseQueryResult | UseMutationResult;
```

## Parameters

### steps

- **Type**: `TutorialStep[]`
- **Required**: Yes
- **Description**: No description available

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with current step, navigation functions, and completion state

## Usage

```typescript
import { useTutorial } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useTutorial([]);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const tutorial = useTutorial([
  {
    id: 'welcome',
    title: 'Welcome!',
    description: 'Click the button to start'
  },
  {
    id: 'controls',
    title: 'Controls',
    description: 'Use arrow keys to move',
    target: '#game-controls'
  }
]);

<TutorialOverlay {...tutorial} />
```
