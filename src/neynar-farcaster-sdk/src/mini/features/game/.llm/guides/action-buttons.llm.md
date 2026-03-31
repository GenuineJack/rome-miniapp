# ActionButtons

**Type**: component

ActionButtons - Pre-built action button group for games Provides 1-2 action buttons (jump, shoot, etc.) with dual input support. Use this for platformer games, shooters, or any game needing action buttons.

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
