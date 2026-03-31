# ActionButtons

**Type**: component

ActionButtons - Pre-built action button group for games

Provides 1-2 action buttons (jump, shoot, etc.) with dual input support.
Shows keyboard shortcuts on hover when keyboardHints prop is provided.
Labels can be text, icons, or any React node.

## JSX Usage

```jsx
import { ActionButtons } from "@/neynar-farcaster-sdk/game";

<ActionButtons
  onAction={handleAction}
  onAction2={handleAction2}
  actionLabel="↑"
  action2Label="A"
  actionVariant="secondary"
  action2Variant="outline"
  buttonSize="w-12 h-12"
  layout="horizontal"
  className=""
  keyboardHints={[]}
  activeKeys={value}
/>;
```

## Component Props

### onAction

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### onAction2

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available

### actionLabel

- **Type**: `React.ReactNode`
- **Required**: No
- **Description**: No description available
- **Default**: "↑"

### action2Label

- **Type**: `React.ReactNode`
- **Required**: No
- **Description**: No description available
- **Default**: "A"

### actionVariant

- **Type**: `"default" | "secondary" | "outline" | "ghost"`
- **Required**: No
- **Description**: No description available
- **Default**: "secondary"

### action2Variant

- **Type**: `"default" | "secondary" | "outline" | "ghost"`
- **Required**: No
- **Description**: No description available
- **Default**: "outline"

### buttonSize

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: "w-12 h-12"

### layout

- **Type**: `"horizontal" | "vertical"`
- **Required**: No
- **Description**: No description available
- **Default**: "horizontal"

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: ""

### keyboardHints

- **Type**: `{
  action?: string[];
  action2?: string[];
}`
- **Required**: No
- **Description**: No description available

### activeKeys

- **Type**: `Set<GameAction>`
- **Required**: No
- **Description**: No description available

## Examples

### Example 1

```tsx
// Define action handler
const handleJump = () => playerJump();
// Register with game initialization
useInitializeGame({
  actions: {
    action: { handler: handleJump },
  },
});
// Get handlers for button
const handlers = useGameActionHandlers();
const activeKeys = useActiveGameActions();
<ActionButtons
  onAction={handlers.action}
  actionLabel="↑"
  activeKeys={activeKeys}
/>;
```

### Example 2

```tsx
import { RotateCw, ArrowDown } from "lucide-react";
<ActionButtons
  onAction={() => rotate()}
  onAction2={() => drop()}
  actionLabel={<RotateCw className="w-4 h-4" />}
  action2Label={<ArrowDown className="w-4 h-4" />}
/>;
```

### Example 3

```tsx
<ActionButtons
  onAction={() => playerJump()}
  onAction2={() => playerShoot()}
  actionLabel="Jump"
  action2Label="Fire"
/>
```
