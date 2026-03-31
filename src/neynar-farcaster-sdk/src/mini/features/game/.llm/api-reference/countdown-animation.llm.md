# CountdownAnimation

**Type**: component

Full-screen countdown animation (3... 2... 1... GO!)

Displays a full-screen overlay with animated countdown.
Auto-removes from DOM when complete.

## JSX Usage

```jsx
import { CountdownAnimation } from '@/neynar-farcaster-sdk/game';

<CountdownAnimation
  onComplete={handleComplete}
  startFrom=3
  className=""
/>
```

## Component Props

### onComplete

- **Type**: `() => void`
- **Required**: Yes
- **Description**: Callback when animation completes

### startFrom

- **Type**: `number`
- **Required**: No
- **Description**: Starting number (default: 3)
- **Default**: 3

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const [showCountdown, setShowCountdown] = useState(true);
{showCountdown && (
<CountdownAnimation
onComplete={() => {
setShowCountdown(false);
startGame();
}}
/>
)}

```

```
