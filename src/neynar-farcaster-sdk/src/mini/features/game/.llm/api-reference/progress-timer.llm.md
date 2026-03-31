# ProgressTimer

**Type**: component

Circular or linear progress indicator with time display

Combines visual progress with formatted time display.
Use with useCountdown or useStopwatch hooks.

## JSX Usage

```jsx
import { ProgressTimer } from '@/neynar-farcaster-sdk/game';

<ProgressTimer
  current={0}
  total={0}
  variant="circular"
  size=120
  format="MM:SS"
  className=""
/>
```

## Component Props

### current

- **Type**: `number`
- **Required**: Yes
- **Description**: Current time in milliseconds

### total

- **Type**: `number`
- **Required**: Yes
- **Description**: Total time in milliseconds

### variant

- **Type**: `"circular" | "linear"`
- **Required**: No
- **Description**: Display style (circular or linear)
- **Default**: "circular"

### size

- **Type**: `number`
- **Required**: No
- **Description**: Diameter in pixels for circular variant (default: 120)
- **Default**: 120

### format

- **Type**: `"MM:SS" | "MM:SS.mmm" | "seconds"`
- **Required**: No
- **Description**: Time format (default: 'MM:SS')
- **Default**: "MM:SS"

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { timeLeft } = useCountdown(60);
// Circular progress
<ProgressTimer
  current={timeLeft}
  total={60000}
  variant="circular"
  size={120}
/>
// Linear progress
<ProgressTimer
  current={timeLeft}
  total={60000}
  variant="linear"
/>

```

```
