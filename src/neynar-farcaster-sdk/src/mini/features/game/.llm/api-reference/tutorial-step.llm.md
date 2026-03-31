# TutorialStep

**Type**: type

TutorialStep type

## Type Definition

```typescript
import { TutorialStep } from "@/neynar-farcaster-sdk/game";

type TutorialStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
  onComplete?: () => void;
};
```

## Type Properties

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### title

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### description

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### target

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### position

- **Type**: `"top" | "bottom" | "left" | "right"`
- **Required**: No
- **Description**: No description available

### onComplete

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available
