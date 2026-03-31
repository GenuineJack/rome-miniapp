# Timer

**Type**: component

Formatted time display component

Displays time in various formats. This is a presentation component
(doesn't manage state - just displays the provided milliseconds).
Use with useCountdown or useStopwatch hooks.

## JSX Usage

```jsx
import { Timer } from "@/neynar-farcaster-sdk/game";

<Timer milliseconds={0} format="MM:SS" className="" />;
```

## Component Props

### milliseconds

- **Type**: `number`
- **Required**: Yes
- **Description**: Time value in milliseconds

### format

- **Type**: `"MM:SS" | "MM:SS.mmm" | "HH:MM:SS" | "seconds"`
- **Required**: No
- **Description**: Display format (default: 'MM:SS')
- **Default**: "MM:SS"

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { timeLeft } = useCountdown(60);
// Display as MM:SS
<Timer milliseconds={timeLeft} format="MM:SS" />
// Output: "01:00", "00:45", "00:00"
// Display with milliseconds
<Timer milliseconds={elapsed} format="MM:SS.mmm" />
// Output: "01:23.456"
// Display as seconds
<Timer milliseconds={elapsed} format="seconds" />
// Output: "83s"

```

```
