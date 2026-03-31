# useGameLoop

**Type**: hook

Provides a 60 FPS game loop for frame-based games

Calls the callback function at a specified frame rate (default 60 FPS).
Automatically pauses when the game is paused via `useGamePaused()`.
Uses requestAnimationFrame for smooth, browser-optimized timing.

## Import

```typescript
import { useGameLoop } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useGameLoop(callback: (deltaTime: number) => void, fps: number): void;
```

## Parameters

### callback

- **Type**: `(deltaTime: number) => void`
- **Required**: Yes
- **Description**: No description available

### fps

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

## Returns

```typescript
void
```

## Usage

```typescript
import { useGameLoop } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useGameLoop(123, 123);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
// Snake game with 60 FPS game loop
useGameLoop((deltaTime) => {
  // Move snake based on deltaTime
  moveSnake(speed * deltaTime);
  checkCollisions();
  updateScore();
}, 60);

// Slower update rate for turn-based game
useGameLoop((deltaTime) => {
  updateAnimations(deltaTime);
}, 30);
```
