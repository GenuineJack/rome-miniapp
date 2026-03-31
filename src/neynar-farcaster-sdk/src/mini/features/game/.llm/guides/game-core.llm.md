# Game Core Functionality

**For LLMs**: Comprehensive guide to game initialization, game loop, and state management. Use this for implementing frame-based games with keyboard and touch controls.

## Overview

The game core provides initialization and state management primitives for building frame-based games. Key capabilities:

- **Game Initialization** - Configure game settings and register action handlers
- **Game Loop** - 60 FPS update cycle with deltaTime
- **State Management** - Pause, game over, loading, and controls enabled states
- **Input Tracking** - Monitor active keys/actions for visual feedback
- **Action Handlers** - Globally accessible handlers for touch controls

## Prerequisites

Import from game features module:

```tsx
import {
  useInitializeGame,
  useGameLoop,
  useGamePaused,
  useSetGamePaused,
  useGameOver,
  useSetGameOver,
  useGameLoading,
  useSetGameLoading,
  useGameControlsEnabled,
  useSetGameControlsEnabled,
  useActiveGameActions,
  useSetActiveGameActions,
  useGameActionHandlers,
  useSetGameActionHandlers,
  gameConfigAtom,
} from "@/neynar-farcaster-sdk/game";
```

## APIs Covered

1. `useInitializeGame` - Initialize game configuration and action handlers
2. `useGameLoop` - 60 FPS game loop with automatic pause integration
3. `useGamePaused` / `useSetGamePaused` - Pause state management
4. `useGameOver` / `useSetGameOver` - Game over state
5. `useGameLoading` / `useSetGameLoading` - Loading state
6. `useGameControlsEnabled` / `useSetGameControlsEnabled` - Controls enable/disable
7. `useActiveGameActions` / `useSetActiveGameActions` - Track currently pressed keys
8. `useGameActionHandlers` / `useSetGameActionHandlers` - Access global handlers
9. `gameConfigAtom` - Global game configuration atom

## Complete API Reference

### useInitializeGame

Initialize game configuration and register action handlers.

**Signature:**

```typescript
function useInitializeGame(options?: {
  allowNegativeScore?: boolean;
  actions?: GameActionHandlers;
}): void;
```

**Parameters:**

- `options.allowNegativeScore` (boolean, optional) - Allow score to go below 0. Default: false
- `options.actions` (GameActionHandlers, optional) - Map of actions to their handler configurations

**GameActionHandlers Type:**

```typescript
type GameActionHandlers = Partial<Record<GameAction, GameActionHandler>>;

type GameAction =
  | "left"
  | "right"
  | "up"
  | "down"
  | "jump"
  | "action"
  | "action2"
  | "pause"
  | "select";

type GameActionHandler = {
  handler: () => void;
  keys?: string[];
  rateLimitMs?: number;
  allowRepeat?: boolean;
};
```

**Default Key Bindings:**

- `left` - ArrowLeft, a, A
- `right` - ArrowRight, d, D
- `up` - ArrowUp, w, W
- `down` - ArrowDown, s, S
- `jump` - Space, w, W
- `action` - Enter, e, E
- `action2` - Shift, q, Q
- `pause` - Escape, p, P
- `select` - Enter, Space

**Features:**

- Automatic keyboard event listeners
- Configurable rate limiting per action
- Key conflict detection with warnings
- Creates global handlers for touch controls
- Respects `useGameControlsEnabled` state

**Usage:**

```tsx
useInitializeGame({
  allowNegativeScore: true,
  actions: {
    left: {
      handler: () => movePlayer("left"),
      allowRepeat: true,
    },
    right: {
      handler: () => movePlayer("right"),
      allowRepeat: true,
    },
    jump: {
      handler: () => playerJump(),
      allowRepeat: false,
      rateLimitMs: 500,
    },
    action: {
      keys: ["f", "F"],
      handler: () => shoot(),
      rateLimitMs: 100,
    },
  },
});
```

### useGameLoop

Provides a 60 FPS game loop for frame-based games.

**Signature:**

```typescript
function useGameLoop(callback: (deltaTime: number) => void, fps?: number): void;
```

**Parameters:**

- `callback` - Function called each frame with deltaTime in milliseconds
- `fps` - Target frames per second (default: 60)

**Behavior:**

- Uses `requestAnimationFrame` for smooth timing
- Automatically pauses when `useGamePaused()` returns true
- Resets timing on resume to avoid deltaTime spikes
- Accumulates time for consistent frame rate

**Usage:**

```tsx
useGameLoop((deltaTime) => {
  updatePlayerPosition(deltaTime);
  updateEnemies(deltaTime);
  checkCollisions();
}, 60);
```

### useGamePaused / useSetGamePaused

Manage game pause state.

**Signatures:**

```typescript
function useGamePaused(): boolean;
function useSetGamePaused(): (value: boolean) => void;
```

**Usage:**

```tsx
const isPaused = useGamePaused();
const setIsPaused = useSetGamePaused();

function togglePause() {
  setIsPaused((prev) => !prev);
}

// useGameLoop automatically respects pause state
useGameLoop((deltaTime) => {
  // This won't run when isPaused is true
  updateGame(deltaTime);
});
```

### useGameOver / useSetGameOver

Track game over state.

**Signatures:**

```typescript
function useGameOver(): boolean;
function useSetGameOver(): (value: boolean) => void;
```

**Usage:**

```tsx
const isGameOver = useGameOver();
const setIsGameOver = useSetGameOver();

function handlePlayerDeath() {
  setIsGameOver(true);
}

if (isGameOver) {
  return <GameOverScreen />;
}
```

### useGameLoading / useSetGameLoading

Track loading state.

**Signatures:**

```typescript
function useGameLoading(): boolean;
function useSetGameLoading(): (value: boolean) => void;
```

**Usage:**

```tsx
const isLoading = useGameLoading();
const setIsLoading = useSetGameLoading();

async function loadAssets() {
  setIsLoading(true);
  await Promise.all([loadSprites(), loadSounds()]);
  setIsLoading(false);
}

if (isLoading) {
  return <LoadingScreen />;
}
```

### useGameControlsEnabled / useSetGameControlsEnabled

Enable or disable game controls.

**Signatures:**

```typescript
function useGameControlsEnabled(): boolean;
function useSetGameControlsEnabled(): (value: boolean) => void;
```

**Usage:**

```tsx
const setControlsEnabled = useSetGameControlsEnabled();

// Disable during animation
useEffect(() => {
  if (isAnimating) {
    setControlsEnabled(false);
  } else {
    setControlsEnabled(true);
  }
}, [isAnimating, setControlsEnabled]);
```

### useActiveGameActions / useSetActiveGameActions

Track currently active (pressed) actions.

**Signatures:**

```typescript
function useActiveGameActions(): Set<GameAction>;
function useSetActiveGameActions(): (
  value: Set<GameAction> | ((prev: Set<GameAction>) => Set<GameAction>),
) => void;
```

**Usage:**

```tsx
const activeKeys = useActiveGameActions();

// Visual feedback for active buttons
const isJumpActive = activeKeys.has("jump");

return (
  <Button
    className={isJumpActive ? "bg-blue-500" : "bg-gray-500"}
    onTouchStart={handlers.jump}
  >
    Jump
  </Button>
);
```

### useGameActionHandlers / useSetGameActionHandlers

Access globally stored action handlers.

**Signatures:**

```typescript
function useGameActionHandlers(): Record<GameAction, () => void>;
function useSetGameActionHandlers(): (
  value: Record<GameAction, () => void>,
) => void;
```

**Usage:**

```tsx
const handlers = useGameActionHandlers();

return (
  <div>
    <button onTouchStart={handlers.left}>←</button>
    <button onTouchStart={handlers.right}>→</button>
    <button onTouchStart={handlers.jump}>↑</button>
  </div>
);
```

### gameConfigAtom

Global game configuration atom (Jotai).

**Type:**

```typescript
type GameConfig = {
  allowNegativeScore: boolean;
};
```

**Usage:**

```tsx
import { useAtomValue } from "jotai";

const config = useAtomValue(gameConfigAtom);
const canGoNegative = config.allowNegativeScore;
```

## Implementation Patterns

### Pattern 1: Basic Initialization

Minimal setup for action-based game.

```tsx
"use client";

import { useInitializeGame, useScore } from "@/neynar-farcaster-sdk/game";

export default function SimpleGame() {
  const { score, addScore } = useScore();

  useInitializeGame({
    actions: {
      action: {
        handler: () => addScore(10),
      },
    },
  });

  return (
    <div>
      <div>Score: {score}</div>
      <p>Press Enter or E to score points</p>
    </div>
  );
}
```

### Pattern 2: Custom Key Bindings

Override default keys for actions.

```tsx
"use client";

import { useInitializeGame } from "@/neynar-farcaster-sdk/game";
import { useState } from "react";

export default function CustomControlsGame() {
  const [playerX, setPlayerX] = useState(50);

  useInitializeGame({
    actions: {
      // Custom keys for left/right
      left: {
        keys: ["q", "Q"],
        handler: () => setPlayerX((x) => Math.max(0, x - 5)),
        allowRepeat: true,
      },
      right: {
        keys: ["e", "E"],
        handler: () => setPlayerX((x) => Math.min(100, x + 5)),
        allowRepeat: true,
      },
      // Custom keys for jump
      jump: {
        keys: ["x", "X", "z", "Z"],
        handler: () => console.log("Jump!"),
        allowRepeat: false,
      },
    },
  });

  return (
    <div>
      <div>Player X: {playerX}</div>
      <p>Controls: Q/E to move, X/Z to jump</p>
    </div>
  );
}
```

### Pattern 3: Rate-Limited Actions

Prevent action spam with rate limiting.

```tsx
"use client";

import { useInitializeGame } from "@/neynar-farcaster-sdk/game";
import { useSfx } from "@/neynar-farcaster-sdk/audio";
import { useState } from "react";

export default function ShooterGame() {
  const [bullets, setBullets] = useState<number[]>([]);
  const { play } = useSfx();

  const shoot = () => {
    play("shoot");
    setBullets((prev) => [...prev, Date.now()]);
  };

  useInitializeGame({
    actions: {
      action: {
        handler: shoot,
        rateLimitMs: 250, // Max 4 shots per second
      },
      action2: {
        handler: () => {
          play("reload");
          setBullets([]);
        },
        rateLimitMs: 1000, // Can only reload once per second
      },
    },
  });

  return (
    <div>
      <div>Bullets fired: {bullets.length}</div>
      <p>Action: Shoot (max 4/sec)</p>
      <p>Action2: Reload (max 1/sec)</p>
    </div>
  );
}
```

### Pattern 4: Keyboard + Touch Dual Input

Combine keyboard listeners with touch buttons.

```tsx
"use client";

import {
  useInitializeGame,
  useGameActionHandlers,
  GameBoard,
} from "@/neynar-farcaster-sdk/game";
import { useState } from "react";

export default function PlatformerGame() {
  const [playerX, setPlayerX] = useState(50);

  // Initialize keyboard listeners
  useInitializeGame({
    actions: {
      left: {
        handler: () => setPlayerX((x) => Math.max(0, x - 5)),
        allowRepeat: true,
      },
      right: {
        handler: () => setPlayerX((x) => Math.min(100, x + 5)),
        allowRepeat: true,
      },
      jump: {
        handler: () => console.log("Jump!"),
        allowRepeat: false,
      },
    },
  });

  // Get handlers for touch buttons
  const handlers = useGameActionHandlers();

  return (
    <GameBoard
      controls={
        <div className="flex gap-2">
          <button onTouchStart={handlers.left}>←</button>
          <button onTouchStart={handlers.right}>→</button>
          <button onTouchStart={handlers.jump}>↑</button>
        </div>
      }
    >
      <div>
        <div>Player X: {playerX}</div>
        <p>Use arrow keys or buttons</p>
      </div>
    </GameBoard>
  );
}
```

### Pattern 5: Pause-Aware Game Loop

Game loop that respects pause state.

```tsx
"use client";

import {
  useInitializeGame,
  useGameLoop,
  useGamePaused,
  useSetGamePaused,
} from "@/neynar-farcaster-sdk/game";
import { useState, useRef } from "react";

export default function AnimatedGame() {
  const [playerX, setPlayerX] = useState(0);
  const velocityRef = useRef(1);
  const isPaused = useGamePaused();
  const setIsPaused = useSetGamePaused();

  // Initialize pause action
  useInitializeGame({
    actions: {
      pause: {
        handler: () => setIsPaused((prev) => !prev),
      },
    },
  });

  // Game loop automatically pauses
  useGameLoop((deltaTime) => {
    setPlayerX((x) => {
      const newX = x + velocityRef.current * (deltaTime / 16);
      if (newX > 100 || newX < 0) {
        velocityRef.current *= -1;
      }
      return Math.max(0, Math.min(100, newX));
    });
  }, 60);

  return (
    <div>
      <div>Player X: {playerX.toFixed(2)}</div>
      <div>{isPaused ? "PAUSED" : "RUNNING"}</div>
      <p>Press Escape or P to pause</p>
    </div>
  );
}
```

### Pattern 6: Complete Frame-Based Game

Full integration of initialization, loop, and state management.

```tsx
"use client";

import {
  useInitializeGame,
  useGameLoop,
  useGamePaused,
  useSetGamePaused,
  useGameOver,
  useSetGameOver,
  useScore,
  GameBoard,
  useGameActionHandlers,
} from "@/neynar-farcaster-sdk/game";
import { useSfx } from "@/neynar-farcaster-sdk/audio";
import { Tabs, TabsList, TabsTrigger, TabsContent, H3 } from "@neynar/ui";
import { useState, useRef } from "react";

type Entity = {
  x: number;
  y: number;
};

export default function CompleteGame() {
  const [player, setPlayer] = useState<Entity>({ x: 50, y: 80 });
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const { score, addScore, resetScore } = useScore();
  const { play } = useSfx();

  const isPaused = useGamePaused();
  const setIsPaused = useSetGamePaused();
  const isGameOver = useGameOver();
  const setIsGameOver = useSetGameOver();

  const velocityRef = useRef({ x: 0, y: 0 });

  const moveLeft = () => {
    velocityRef.current.x = -2;
  };

  const moveRight = () => {
    velocityRef.current.x = 2;
  };

  const stopMoving = () => {
    velocityRef.current.x = 0;
  };

  const shoot = () => {
    play("shoot");
    addScore(10);
  };

  const restart = () => {
    setPlayer({ x: 50, y: 80 });
    setEnemies([]);
    resetScore();
    setIsGameOver(false);
    velocityRef.current = { x: 0, y: 0 };
  };

  // Initialize controls
  useInitializeGame({
    allowNegativeScore: false,
    actions: {
      left: { handler: moveLeft, allowRepeat: true },
      right: { handler: moveRight, allowRepeat: true },
      action: { handler: shoot, rateLimitMs: 200 },
      pause: { handler: () => setIsPaused((prev) => !prev) },
    },
  });

  // Game loop
  useGameLoop((deltaTime) => {
    if (isGameOver) return;

    // Update player position
    setPlayer((p) => ({
      x: Math.max(0, Math.min(100, p.x + velocityRef.current.x)),
      y: p.y,
    }));

    // Update enemies
    setEnemies((enemies) =>
      enemies.map((e) => ({ ...e, y: e.y + 0.5 })).filter((e) => e.y < 100),
    );

    // Spawn enemies
    if (Math.random() < 0.01) {
      setEnemies((prev) => [...prev, { x: Math.random() * 100, y: 0 }]);
    }

    // Check collisions
    enemies.forEach((enemy) => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 5) {
        play("hit");
        setIsGameOver(true);
      }
    });
  }, 60);

  // Get handlers for touch controls
  const handlers = useGameActionHandlers();

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-4xl font-bold">Game Over!</h1>
        <div className="text-2xl">Final Score: {score}</div>
        <button
          onClick={restart}
          className="px-6 py-3 bg-blue-500 text-white rounded"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex gap-2">
                  <button
                    onTouchStart={handlers.left}
                    onTouchEnd={stopMoving}
                    className="px-4 py-2 bg-gray-700 rounded"
                  >
                    ←
                  </button>
                  <button
                    onTouchStart={handlers.right}
                    onTouchEnd={stopMoving}
                    className="px-4 py-2 bg-gray-700 rounded"
                  >
                    →
                  </button>
                  <button
                    onTouchStart={handlers.action}
                    className="px-4 py-2 bg-red-500 rounded"
                  >
                    Shoot
                  </button>
                  <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="px-4 py-2 bg-yellow-500 rounded"
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                </div>
              }
            >
              <div className="relative w-full h-full bg-gray-900">
                <div className="absolute top-2 left-2 text-white">
                  Score: {score}
                </div>
                {isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-4xl font-bold text-white">PAUSED</div>
                  </div>
                )}
                <div
                  className="absolute w-4 h-4 bg-blue-500 rounded"
                  style={{ left: `${player.x}%`, top: `${player.y}%` }}
                />
                {enemies.map((enemy, i) => (
                  <div
                    key={i}
                    className="absolute w-4 h-4 bg-red-500 rounded"
                    style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
                  />
                ))}
              </div>
            </GameBoard>
          ),
        },
        {
          label: "Stats",
          content: (
            <div className="p-4">
              <div>Score: {score}</div>
              <div>Enemies: {enemies.length}</div>
              <div>Status: {isPaused ? "Paused" : "Playing"}</div>
            </div>
          ),
        },
      ]}
    />
  );
}
```

## Common Combinations

**With Score System**: [use-score.llm.md](./use-score.llm.md)

```tsx
const { score, addScore } = useScore();
useInitializeGame({
  actions: {
    action: { handler: () => addScore(10) },
  },
});
```

**With Timer System**: [use-countdown.llm.md](./use-countdown.llm.md)

```tsx
const { timeLeft, start } = useCountdown(60);
useEffect(() => {
  if (timeLeft === 0) setIsGameOver(true);
}, [timeLeft]);
```

**With Audio**: [use-sfx.llm.md](./use-sfx.llm.md)

```tsx
const { play } = useSfx();
useInitializeGame({
  actions: {
    action: {
      handler: () => {
        play("blip");
        addScore(10);
      },
    },
  },
});
```

**With Visual Effects**: Screen shake, particles

```tsx
import { useScreenShake } from "@/neynar-farcaster-sdk/game";

const { shake } = useScreenShake();
useInitializeGame({
  actions: {
    action: {
      handler: () => {
        shake(5, 200);
        addScore(10);
      },
    },
  },
});
```

**With Combos**: [use-combo.llm.md](./use-combo.llm.md)

```tsx
const { combo, multiplier, addCombo } = useCombo();
useInitializeGame({
  actions: {
    action: {
      handler: () => {
        addScore(10 * multiplier);
        addCombo();
      },
    },
  },
});
```

## Related Files

**Source Files:**

- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/initialization/use-initialize-game.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/initialization/use-game-loop.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/use-game-state.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/private/types.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/private/atoms.ts`

**Implementation Guides:**

- [quickstart-implementation.md](../features/game/.llm/guides/quickstart-implementation.md) - Minimal viable game
- [controls-implementation.md](../features/game/.llm/guides/controls-implementation.md) - Touch + keyboard patterns
- [state-management.md](../features/game/.llm/guides/state-management.md) - Global state architecture

**Related APIs:**

- [use-score.llm.md](./use-score.llm.md) - Score tracking
- [use-combo.llm.md](./use-combo.llm.md) - Combo system
- [use-countdown.llm.md](./use-countdown.llm.md) - Timer system
- [use-sfx.llm.md](./use-sfx.llm.md) - Sound effects
