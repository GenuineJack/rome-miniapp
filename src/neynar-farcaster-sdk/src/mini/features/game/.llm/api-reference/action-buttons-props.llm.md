# ActionButtonsProps

**Type**: type

ActionButtonsProps type

## Type Definition

```typescript
import { ActionButtonsProps } from "@/neynar-farcaster-sdk/game";

type ActionButtonsProps = {
  /**
   * Handler for primary action button (jump, shoot, etc.)
   */
  onAction?: () => void;

  /**
   * Handler for secondary action button (optional)
   */
  onAction2?: () => void;

  /**
   * Label for primary action button
   * @default "↑"
   */
  actionLabel?: React.ReactNode;

  /**
   * Label for secondary action button
   * @default "A"
   */
  action2Label?: React.ReactNode;

  /**
   * Button variant for primary action
   * @default "secondary"
   */
  actionVariant?: "default" | "secondary" | "outline" | "ghost";

  /**
   * Button variant for secondary action
   * @default "outline"
   */
  action2Variant?: "default" | "secondary" | "outline" | "ghost";

  /**
   * Button size
   * @default "w-12 h-12"
   */
  buttonSize?: string;

  /**
   * Layout orientation
   * @default "horizontal"
   */
  layout?: "horizontal" | "vertical";

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Optional keyboard shortcuts to display on buttons
   * Get these from useActiveGameActions after calling useInitializeGame
   */
  keyboardHints?: {
    action?: string[];
    action2?: string[];
  };

  /**
   * Set of currently active actions for visual feedback
   * Get this from useActiveGameActions after calling useInitializeGame
   */
  activeKeys?: Set<GameAction>;
};
```

## Type Properties

### onAction

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for primary action button (jump, shoot, etc.)

### onAction2

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for secondary action button (optional)

### actionLabel

- **Type**: `React.ReactNode`
- **Required**: No
- **Description**: Label for primary action button

### action2Label

- **Type**: `React.ReactNode`
- **Required**: No
- **Description**: Label for secondary action button

### actionVariant

- **Type**: `"default" | "secondary" | "outline" | "ghost"`
- **Required**: No
- **Description**: Button variant for primary action

### action2Variant

- **Type**: `"default" | "secondary" | "outline" | "ghost"`
- **Required**: No
- **Description**: Button variant for secondary action

### buttonSize

- **Type**: `string`
- **Required**: No
- **Description**: Button size

### layout

- **Type**: `"horizontal" | "vertical"`
- **Required**: No
- **Description**: Layout orientation

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes for the container

### keyboardHints

- **Type**: `{
  action?: string[];
  action2?: string[];
}`
- **Required**: No
- **Description**: Optional keyboard shortcuts to display on buttons
  Get these from useActiveGameActions after calling useInitializeGame

### activeKeys

- **Type**: `Set<GameAction>`
- **Required**: No
- **Description**: Set of currently active actions for visual feedback
  Get this from useActiveGameActions after calling useInitializeGame
