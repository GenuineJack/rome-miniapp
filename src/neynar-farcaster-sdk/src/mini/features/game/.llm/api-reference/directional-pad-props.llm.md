# DirectionalPadProps

**Type**: type

DirectionalPadProps type

## Type Definition

```typescript
import { DirectionalPadProps } from "@/neynar-farcaster-sdk/game";

type DirectionalPadProps = {
  /**
   * Handler for left button press
   */
  onLeft?: () => void;

  /**
   * Handler for right button press
   */
  onRight?: () => void;

  /**
   * Handler for up button press
   */
  onUp?: () => void;

  /**
   * Handler for down button press
   */
  onDown?: () => void;

  /**
   * Layout style for the D-pad
   * - "horizontal": Left and right arrows only (side-scrollers, racing)
   * - "vertical": Up and down arrows only (elevator games, vertical scrollers)
   * - "full": All four directions (top-down games, menus)
   * @default "horizontal"
   */
  layout?: "horizontal" | "vertical" | "full";

  /**
   * Button size classes
   * @default "w-12 h-12"
   */
  buttonSize?: string;

  /**
   * Additional CSS classes for the container
   */
  className?: string;

  /**
   * Optional keyboard shortcuts to display on buttons
   * (Currently not displayed - reserved for future use)
   */
  keyboardHints?: {
    left?: string[];
    right?: string[];
    up?: string[];
    down?: string[];
  };
};
```

## Type Properties

### onLeft

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for left button press

### onRight

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for right button press

### onUp

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for up button press

### onDown

- **Type**: `() => void`
- **Required**: No
- **Description**: Handler for down button press

### layout

- **Type**: `"horizontal" | "vertical" | "full"`
- **Required**: No
- **Description**: Layout style for the D-pad
- "horizontal": Left and right arrows only (side-scrollers, racing)
- "vertical": Up and down arrows only (elevator games, vertical scrollers)
- "full": All four directions (top-down games, menus)

### buttonSize

- **Type**: `string`
- **Required**: No
- **Description**: Button size classes

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes for the container

### keyboardHints

- **Type**: `{
  left?: string[];
  right?: string[];
  up?: string[];
  down?: string[];
}`
- **Required**: No
- **Description**: Optional keyboard shortcuts to display on buttons
  (Currently not displayed - reserved for future use)
