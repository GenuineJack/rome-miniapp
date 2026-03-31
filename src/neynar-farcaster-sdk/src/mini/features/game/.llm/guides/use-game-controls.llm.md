# useGameControls

**Type**: hook

useGameControls - Unified hook for handling both keyboard and touch game controls This hook automatically sets up keyboard event listeners for your game actions and provides ready-to-use handlers for touch buttons.

## API Surface

```typescript
import { useGameControls } from '@/neynar-farcaster-sdk/game';

export function useGameControls({
  actions,
  keyBindings = {},
  preventDefault = true,
  enabled = true,
}: GameControlsConfig): ReturnType<typeof useGameControls> { ... }
```

## Parameters

### {

actions,
keyBindings = {},
preventDefault = true,
enabled = true,
}

- **Type**: `GameControlsConfig`
- **Required**: Yes
- **Description**: No description available

## Returns

**Return Type**: `ReturnType<typeof useGameControls>`

## Usage

```typescript
import { useGameControls } from "@/neynar-farcaster-sdk/mini";

const result =
  useGameControls(/* {
  actions,
  keyBindings = {},
  preventDefault = true,
  enabled = true,
} */);
```

## Examples

```tsx
function MyGame() {
  const controls = useGameControls({
    actions: {
      left: () => movePlayer("left"),
      right: () => movePlayer("right"),
      jump: () => playerJump(),
    },
  });
  return (
    <div>
      <Button onTouchStart={controls.handlers.left}>←</Button>
      <Button onTouchStart={controls.handlers.right}>→</Button>
      <Button onTouchStart={controls.handlers.jump}>↑</Button>
    </div>
  );
}
```
