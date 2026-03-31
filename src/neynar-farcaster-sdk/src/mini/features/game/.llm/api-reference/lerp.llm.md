# lerp

**Type**: function

Linear interpolation between start and end

## API Surface

```typescript
import { lerp } from '@/neynar-farcaster-sdk/game';

export function lerp(start: number, end: number, t: number): number { ... }
```

## Parameters

### start

- **Type**: `number`
- **Required**: Yes
- **Description**: Starting value

### end

- **Type**: `number`
- **Required**: Yes
- **Description**: Ending value

### t

- **Type**: `number`
- **Required**: Yes
- **Description**: Progress from 0 to 1 (0 = start, 1 = end)

## Returns

- **Type**: `number`
- **Description**: Interpolated value

## Examples

// Smooth camera movement
const cameraX = lerp(currentX, targetX, 0.1);
// Animate score counter
const displayScore = lerp(oldScore, newScore, progress);
// Fade opacity
const opacity = lerp(0, 1, fadeProgress);

```

```
