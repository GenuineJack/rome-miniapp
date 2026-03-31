# distance

**Type**: function

Calculate distance between two points

## API Surface

```typescript
import { distance } from '@/neynar-farcaster-sdk/game';

export function distance(x1: number, y1: number, x2: number, y2: number): number { ... }
```

## Parameters

### x1

- **Type**: `number`
- **Required**: Yes
- **Description**: First point X coordinate

### y1

- **Type**: `number`
- **Required**: Yes
- **Description**: First point Y coordinate

### x2

- **Type**: `number`
- **Required**: Yes
- **Description**: Second point X coordinate

### y2

- **Type**: `number`
- **Required**: Yes
- **Description**: Second point Y coordinate

## Returns

- **Type**: `number`
- **Description**: Euclidean distance between the points

## Examples

// Check if player is near enemy
const dist = distance(playerX, playerY, enemyX, enemyY);
if (dist < 50) {
takeDamage();
}
// Check if click hit target
const clickDist = distance(clickX, clickY, targetX, targetY);
if (clickDist < targetRadius) {
hit();
}

```

```
