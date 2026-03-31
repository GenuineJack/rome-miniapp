# ScoreDisplay

**Type**: component

Animated score counter with smooth count-up animation

Animates from the previous value to the new value using an ease-out
cubic easing function. Pure JavaScript animation with no dependencies.

## JSX Usage

```jsx
import { ScoreDisplay } from '@/neynar-farcaster-sdk/game';

<ScoreDisplay
  value={0}
  duration=500
  className=""
/>
```

## Component Props

### value

- **Type**: `number`
- **Required**: Yes
- **Description**: Current score value to display

### duration

- **Type**: `number`
- **Required**: No
- **Description**: Animation duration in milliseconds (default: 500)
- **Default**: 500

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { score } = useScore(0);
<ScoreDisplay
  value={score}
  duration={500}
  className="text-4xl font-bold"
/>

```

```
