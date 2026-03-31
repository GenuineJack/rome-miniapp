# DirectionalPad

**Type**: component

DirectionalPad - Pre-built directional control component

Provides arrow buttons for directional movement in games.
Automatically handles both touch and mouse input.
Shows keyboard shortcuts on hover when keyboardHints prop is provided.

## JSX Usage

```jsx
import { DirectionalPad } from "@/neynar-farcaster-sdk/game";

<DirectionalPad
  onLeft={handleLeft}
  onRight={handleRight}
  onUp={handleUp}
  onDown={handleDown}
  layout="horizontal"
  buttonSize="w-12 h-12"
  className=""
  keyboardHints={[]}
/>;
```

## Component Props

### onLeft

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### onRight

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### onUp

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### onDown

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### layout

- **Type**: `"horizontal" | "vertical" | "full"`
- **Required**: No
- **Description**: No description available
- **Default**: "horizontal"

### buttonSize

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: "w-12 h-12"

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: ""

### keyboardHints

- **Type**: `{
  left?: string[];
  right?: string[];
  up?: string[];
  down?: string[];
}`
- **Required**: No
- **Description**: No description available

## Examples

### Example 1

```tsx
// Define movement handlers
const moveLeft = () => movePlayer("left");
const moveRight = () => movePlayer("right");
// Register with game initialization
useInitializeGame({
  actions: {
    left: { handler: moveLeft, allowRepeat: true },
    right: { handler: moveRight, allowRepeat: true },
  },
});
// Get handlers for buttons
const handlers = useGameActionHandlers();
<DirectionalPad
  layout="horizontal"
  onLeft={handlers.left}
  onRight={handlers.right}
/>;
```

### Example 2

```tsx
<DirectionalPad
  layout="full"
  onLeft={() => move("left")}
  onRight={() => move("right")}
  onUp={() => move("up")}
  onDown={() => move("down")}
/>
```
