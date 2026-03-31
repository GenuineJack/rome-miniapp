# useScreenShake

**Type**: hook

Screen shake effect for impact feedback (camera/viewport shake)

Generates randomized X/Y offset values that decay over time, creating a camera shake
effect for high-impact moments. Uses requestAnimationFrame for smooth 60 FPS animation.
Intensity controls shake magnitude (1-10 range, auto-clamped). Duration specifies
shake length in milliseconds. Offsets decay linearly to zero.

## Implementation Pattern

Apply offset to game container transform. Use ScreenShakeContainer component
for pre-built integration with proper styling.

## Performance

Uses single requestAnimationFrame loop. Automatically cleans up on unmount.
Multiple shake calls override previous shake (doesn't stack).

## Import

```typescript
import { useScreenShake } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useScreenShake(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with shake trigger function, active state boolean, and current offset

## Usage

```typescript
import { useScreenShake } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useScreenShake();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic implementation - Damage feedback

```typescript
const { shake, isShaking, offset } = useScreenShake();

const handleHit = () => {
shake(8, 500); // Intense shake for 500ms
takeDamage(10);
};

return (
<div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
<GameBoard />
</div>
);
```

### Example 2

Intensity patterns for different events

```typescript
const { shake } = useScreenShake();

// Light shake - Small hit
shake(3, 200);

// Medium shake - Enemy death
shake(6, 400);

// Heavy shake - Explosion or boss hit
shake(10, 800);

// Quick shake - Collision
shake(4, 150);
```

### Example 3

Using ScreenShakeContainer component

```typescript
import { ScreenShakeContainer } from '@/neynar-farcaster-sdk/mini';

const { shake, isShaking, offset } = useScreenShake();

return (
<ScreenShakeContainer isShaking={isShaking} offset={offset}>
<GameBoard />
</ScreenShakeContainer>
);
```

### Example 4

Conditional shake based on game state

```typescript
const { shake } = useScreenShake();
const { health } = useGameState();

const handleDamage = (amount: number) => {
  // Shake intensity proportional to damage
  const intensity = Math.min(10, amount / 2);
  const duration = 200 + amount * 10;
  shake(intensity, duration);

  // Critical health shake is more intense
  if (health < 20) {
    setTimeout(() => shake(5, 300), duration + 100);
  }
};
```
