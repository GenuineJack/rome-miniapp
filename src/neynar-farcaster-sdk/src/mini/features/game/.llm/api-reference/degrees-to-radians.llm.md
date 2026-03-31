# degreesToRadians

**Type**: function

Convert degrees to radians

## API Surface

```typescript
import { degreesToRadians } from '@/neynar-farcaster-sdk/game';

export function degreesToRadians(degrees: number): number { ... }
```

## Parameters

### degrees

- **Type**: `number`
- **Required**: Yes
- **Description**: Angle in degrees

## Returns

- **Type**: `number`
- **Description**: Angle in radians

## Examples

// Rotate sprite
const radians = degreesToRadians(45);
sprite.rotation = radians;
// Calculate circular motion
const angle = degreesToRadians(currentAngle);
const x = centerX + Math.cos(angle) _ radius;
const y = centerY + Math.sin(angle) _ radius;

```

```
