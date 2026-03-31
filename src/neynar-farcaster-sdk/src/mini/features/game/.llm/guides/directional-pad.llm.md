# DirectionalPad

**Type**: component

DirectionalPad - Pre-built directional control component with arrow buttons for movement. Automatically handles touch and mouse input. Shows keyboard shortcuts on hover when keyboardHints prop is provided.

## JSX Usage

```jsx
import { DirectionalPad, useGameControls } from "@/neynar-farcaster-sdk/game";

const controls = useGameControls({
  actions: {
    left: () => moveLeft(),
    right: () => moveRight(),
  },
});

<DirectionalPad
  onLeft={controls.handlers.left}
  onRight={controls.handlers.right}
  layout="horizontal"
  keyboardHints={controls.keyBindings}
/>;
```

## Component Props

### onLeft

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler called when left arrow button is pressed

### onRight

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler called when right arrow button is pressed

### onUp

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler called when up arrow button is pressed

### onDown

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler called when down arrow button is pressed

### layout

- **Type**: `"horizontal" | "vertical" | "full"`
- **Required**: No
- **Default**: "horizontal"
- **Description**: Layout style for the D-pad
  - `"horizontal"`: Left and right arrows only (for side-scrollers, racing games)
  - `"vertical"`: Up and down arrows only (for elevator games, vertical scrollers)
  - `"full"`: All four directions (for top-down games, Tetris, menus)

### buttonSize

- **Type**: `string`
- **Required**: No
- **Default**: "w-12 h-12"
- **Description**: Tailwind CSS classes for button size (e.g., "w-16 h-16")

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes for the container

### keyboardHints

- **Type**: `{ left?: string[]; right?: string[]; up?: string[]; down?: string[]; }`
- **Required**: No
- **Description**: Keyboard shortcuts to display on hover. Pass `controls.keyBindings` from `useGameControls` to show WASD + arrow key hints automatically. Shows up to 2 keys per button (e.g., "A ←")
