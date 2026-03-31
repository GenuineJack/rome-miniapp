# ProgressBar

**Type**: component

Linear progress bar with optional percentage label

Displays progress as a percentage of max value with smooth transitions.
Supports striped and animated variants.

## JSX Usage

```jsx
import { ProgressBar } from '@/neynar-farcaster-sdk/game';

<ProgressBar
  value={0}
  max={0}
  variant="default"
  color="primary"
  showLabel=true
  className=""
/>
```

## Component Props

### value

- **Type**: `number`
- **Required**: Yes
- **Description**: Current value

### max

- **Type**: `number`
- **Required**: Yes
- **Description**: Maximum value

### variant

- **Type**: `"default" | "striped" | "animated"`
- **Required**: No
- **Description**: Visual style (default, striped, or animated)
- **Default**: "default"

### color

- **Type**: `"primary" | "success" | "danger" | "warning"`
- **Required**: No
- **Description**: Color theme (primary, success, danger, or warning)
- **Default**: "primary"

### showLabel

- **Type**: `boolean`
- **Required**: No
- **Description**: Whether to show percentage label (default: true)
- **Default**: true

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

// Health bar
<ProgressBar value={health} max={100} color="success" />
// Loading bar
<ProgressBar
  value={loaded}
  max={total}
  variant="animated"
  color="primary"
/>
// Time remaining
<ProgressBar
  value={timeLeft}
  max={60000}
  color="warning"
  showLabel={false}
/>

```

```
