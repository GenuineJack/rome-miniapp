# radiansToDegrees

**Type**: function

Convert radians to degrees

## API Surface

```typescript
import { radiansToDegrees } from '@/neynar-farcaster-sdk/game';

export function radiansToDegrees(radians: number): number { ... }
```

## Parameters

### radians

- **Type**: `number`
- **Required**: Yes
- **Description**: Angle in radians

## Returns

- **Type**: `number`
- **Description**: Angle in degrees

## Examples

// Display angle to user
const degrees = radiansToDegrees(sprite.rotation);
console.log(`Rotation: ${degrees}°`);
// Calculate angle between points
const radians = Math.atan2(dy, dx);
const degrees = radiansToDegrees(radians);

```

```
