# TutorialOverlay

**Type**: component

Tutorial overlay component

Full-screen tutorial UI with step counter, navigation, and element highlighting.
Darkens screen except highlighted element, shows tooltip with instructions.

## JSX Usage

```jsx
import { TutorialOverlay } from "@/neynar-farcaster-sdk/game";

<TutorialOverlay
  currentStep={value}
  stepIndex={0}
  totalSteps={0}
  nextStep={() => {}}
  prevStep={() => {}}
  skipTutorial={() => {}}
  onComplete={handleComplete}
/>;
```

## Component Props

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

## Examples

const tutorial = useTutorial(steps);
{!tutorial.isComplete && (
<TutorialOverlay {...tutorial} />
)}

```

```
