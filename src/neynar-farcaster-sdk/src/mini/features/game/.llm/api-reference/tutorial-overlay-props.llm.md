# TutorialOverlayProps

**Type**: type

TutorialOverlayProps type

## Type Definition

```typescript
import { TutorialOverlayProps } from "@/neynar-farcaster-sdk/game";

type TutorialOverlayProps = {
  currentStep: TutorialStep | null;
  stepIndex: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  onComplete?: () => void;
};
```

## Type Properties

### currentStep

- **Type**: `TutorialStep | null`
- **Required**: Yes
- **Description**: No description available

### stepIndex

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### totalSteps

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### nextStep

- **Type**: `() => void`
- **Required**: Yes
- **Description**: No description available

### prevStep

- **Type**: `() => void`
- **Required**: Yes
- **Description**: No description available

### skipTutorial

- **Type**: `() => void`
- **Required**: Yes
- **Description**: No description available

### onComplete

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available
