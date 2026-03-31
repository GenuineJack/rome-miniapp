# Game Visual Effects & Polish

**For LLMs**: Comprehensive guide to game visual effects ("game juice") for impact, feedback, and polish. Use this for implementing screen shake, particles, flashes, and floating text without external animation libraries.

## Overview

The game effects system provides zero-dependency visual feedback tools for creating polished, satisfying game experiences. Key capabilities:

- **Screen Shake** - Camera shake for impact moments (collisions, explosions)
- **Particle System** - Physics-based particles with velocity and gravity
- **Flash Effects** - Full-screen color flashes for damage or power-ups
- **Pulse Animation** - Scale-based emphasis for UI elements
- **Score Popups** - Floating score feedback text
- **Pure CSS/JS** - No external animation libraries required
- **60 FPS Performance** - RequestAnimationFrame-based updates

## Prerequisites

Import from game features module:

```tsx
import {
  useScreenShake,
  useParticles,
  useFlashEffect,
  usePulse,
  useScorePopup,
  ScreenShakeContainer,
  ParticleEmitter,
  FlashOverlay,
  FloatingText,
} from "@/neynar-farcaster-sdk/mini";
```

## APIs Covered

### Hooks

1. `useScreenShake` - Camera shake effect with intensity and duration
2. `useParticles` - Particle system with physics simulation
3. `useFlashEffect` - Full-screen flash overlay
4. `usePulse` - Scale pulse animation triggered by value changes
5. `useScorePopup` - Floating score text with fade-out

### Components

6. `ScreenShakeContainer` - Wrapper that applies shake transform
7. `ParticleEmitter` - Renders particles from useParticles
8. `FlashOverlay` - Full-screen flash overlay component
9. `FloatingText` - Renders floating score popups

## Complete API Reference

### useScreenShake

Screen shake effect for high-impact moments.

**Signature:**

```typescript
function useScreenShake(): {
  shake: (intensity?: number, duration?: number) => void;
  isShaking: boolean;
  offset: { x: number; y: number };
};
```

**Returns:**

- `shake` - Function to trigger shake effect
  - `intensity` (1-10, default: 5) - Shake magnitude in pixels
  - `duration` (milliseconds, default: 300) - Shake length
- `isShaking` - Boolean indicating active shake state
- `offset` - Current x/y offset values for transform

**Algorithm:**

- Generates random X/Y offsets within intensity range
- Decays linearly from full intensity to zero
- Uses `requestAnimationFrame` for smooth 60 FPS updates
- Multiple shake calls override previous shake (doesn't stack)

**Intensity Guidelines:**

- `1-3`: Light shake (small collision, UI feedback)
- `4-6`: Medium shake (enemy defeat, pickup)
- `7-9`: Heavy shake (explosion, boss hit)
- `10`: Maximum shake (screen-clearing event)

**Example:**

```tsx
const { shake, isShaking, offset } = useScreenShake();

const handleExplosion = () => {
  shake(8, 500); // Heavy shake for 500ms
};

return (
  <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
    <GameContent />
  </div>
);
```

### useParticles

Physics-based particle system for confetti, explosions, sparkles.

**Signature:**

```typescript
function useParticles(): {
  particles: Particle[];
  emit: (config: EmitConfig) => void;
  clear: () => void;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity X (pixels/second)
  vy: number; // velocity Y (pixels/second)
  life: number; // 1.0 to 0.0
  color: string;
  size: number;
};

type EmitConfig = {
  x: number; // Spawn X position
  y: number; // Spawn Y position
  count?: number; // Number of particles (default: 20)
  colors?: string[]; // Color palette (default: gold/orange/red)
  speed?: number; // Base speed in pixels/second (default: 200)
  spread?: number; // Angle spread in degrees (default: 360)
  gravity?: number; // Pixels/second² (default: 200)
  life?: number; // Lifetime in seconds (default: 1)
  angle?: number; // Base angle in degrees (default: -90 upward)
};
```

**Returns:**

- `particles` - Array of active particles to render
- `emit` - Function to spawn particles with configuration
- `clear` - Function to remove all particles immediately

**Physics Model:**

- Position updated each frame: `x += vx * deltaTime`
- Gravity applied: `vy += gravity * deltaTime`
- Life decreases: `life -= deltaTime`
- Particles removed when `life <= 0`

**Performance:**

- Uses `useGameLoop` at 60 FPS
- Automatically cleans up dead particles
- Efficient array filtering per frame
- No active updates when `particles.length === 0`

**Example:**

```tsx
const { particles, emit } = useParticles();

const handleScore = (x: number, y: number) => {
  emit({
    x,
    y,
    count: 30,
    colors: ["#FFD700", "#FFA500"],
    speed: 250,
    spread: 180, // Upward cone
    angle: -90, // Shoot upward
  });
};

return (
  <>
    {particles.map((p) => (
      <div
        key={p.id}
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          opacity: p.life,
          borderRadius: "50%",
        }}
      />
    ))}
  </>
);
```

### useFlashEffect

Full-screen color flash for damage, power-ups, transitions.

**Signature:**

```typescript
function useFlashEffect(): {
  flash: (color?: string, duration?: number) => void;
  isFlashing: boolean;
  flashOpacity: number;
  flashColor: string;
};
```

**Returns:**

- `flash` - Function to trigger flash effect
  - `color` (string, default: "white") - CSS color for flash
  - `duration` (milliseconds, default: 200) - Flash length
- `isFlashing` - Boolean indicating active flash state
- `flashOpacity` - Current opacity value (0 to 0.8)
- `flashColor` - Current flash color

**Timing Curve:**

- 0-30% of duration: Fast fade in to 0.8 opacity
- 30-100% of duration: Slow fade out to 0 opacity
- Creates punchy "snap in, ease out" effect

**Color Patterns:**

- Red: `'rgba(255, 0, 0, 0.5)'` - Damage, danger
- White: `'rgba(255, 255, 255, 0.8)'` - Explosion, flash
- Gold: `'rgba(255, 215, 0, 0.6)'` - Power-up, coin
- Green: `'rgba(0, 255, 0, 0.5)'` - Healing, success
- Blue: `'rgba(0, 150, 255, 0.6)'` - Shield, freeze

**Example:**

```tsx
const { flash, flashOpacity, flashColor } = useFlashEffect();

const handleDamage = () => {
  flash("rgba(255, 0, 0, 0.5)", 300); // Red flash
  takeDamage(10);
};

const handlePowerUp = () => {
  flash("rgba(255, 215, 0, 0.6)", 400); // Gold flash
  addPowerUp();
};

return (
  <>
    <GameContent />
    {flashOpacity > 0 && (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundColor: flashColor, opacity: flashOpacity }}
      />
    )}
  </>
);
```

### usePulse

Scale pulse animation triggered by value changes.

**Signature:**

```typescript
function usePulse(trigger: any): {
  scale: number;
};
```

**Parameters:**

- `trigger` - Value to watch (usually score, health, combo)

**Returns:**

- `scale` - Current scale value (1.0 to 1.2 and back)

**Animation:**

- Duration: 300ms total
- Curve: 1.0 → 1.2 → 1.0 (symmetric triangle wave)
- Only animates when `trigger` value changes
- Previous frame canceled if new trigger fires

**Example:**

```tsx
const { scale } = usePulse(score);

return <div style={{ transform: `scale(${scale})` }}>Score: {score}</div>;
```

### useScorePopup

Floating score text that rises and fades out.

**Signature:**

```typescript
function useScorePopup(): {
  popups: ScorePopup[];
  show: (x: number, y: number, value: number) => void;
};

type ScorePopup = {
  id: string;
  x: number;
  y: number;
  value: number;
  life: number; // 1.0 to 0.0
};
```

**Returns:**

- `popups` - Array of active popups to render
- `show` - Function to create new popup
  - `x` - Screen X position
  - `y` - Screen Y position
  - `value` - Number to display (can be negative)

**Animation:**

- Duration: ~1000ms
- Floats upward: `y - (1 - life) * 50`
- Fades out: opacity tied to life
- Auto-cleanup when life reaches 0

**Example:**

```tsx
const { popups, show } = useScorePopup();

const handleCollectCoin = (coinX: number, coinY: number) => {
  show(coinX, coinY, 100);
  addScore(100);
};

return (
  <>
    {popups.map((popup) => (
      <div
        key={popup.id}
        style={{
          position: "absolute",
          left: popup.x,
          top: popup.y - (1 - popup.life) * 50,
          opacity: popup.life,
          fontSize: "24px",
          fontWeight: "bold",
          color: popup.value > 0 ? "#22C55E" : "#EF4444",
        }}
      >
        {popup.value > 0 ? "+" : ""}
        {popup.value}
      </div>
    ))}
  </>
);
```

### ScreenShakeContainer

Wrapper component that applies shake transform.

**Type:**

```typescript
type ScreenShakeContainerProps = {
  children: ReactNode;
  isShaking: boolean;
  offset: { x: number; y: number };
  className?: string;
};
```

**Props:**

- `children` - Game content to shake
- `isShaking` - Whether shake is active
- `offset` - X/Y offset from `useScreenShake`
- `className` - Additional CSS classes

**Example:**

```tsx
const { shake, isShaking, offset } = useScreenShake();

return (
  <ScreenShakeContainer isShaking={isShaking} offset={offset}>
    <YourGame />
  </ScreenShakeContainer>
);
```

### ParticleEmitter

Renders particles as colored circles.

**Type:**

```typescript
type ParticleEmitterProps = {
  particles: Particle[];
  className?: string;
};
```

**Props:**

- `particles` - Array from `useParticles`
- `className` - Additional CSS classes for each particle

**Example:**

```tsx
const { particles, emit } = useParticles();

return (
  <div className="relative">
    <ParticleEmitter particles={particles} />
    <button onClick={() => emit({ x: 100, y: 100 })}>Emit</button>
  </div>
);
```

### FlashOverlay

Full-screen flash overlay component.

**Type:**

```typescript
type FlashOverlayProps = {
  isFlashing: boolean;
  opacity: number;
  color: string;
};
```

**Props:**

- `isFlashing` - Whether flash is active
- `opacity` - Current opacity from `useFlashEffect`
- `color` - Current color from `useFlashEffect`

**Example:**

```tsx
const { flash, isFlashing, flashOpacity, flashColor } = useFlashEffect();

return (
  <>
    <GameContent />
    <FlashOverlay
      isFlashing={isFlashing}
      opacity={flashOpacity}
      color={flashColor}
    />
  </>
);
```

### FloatingText

Renders floating score popups.

**Type:**

```typescript
type FloatingTextProps = {
  popups: ScorePopup[];
  className?: string;
};
```

**Props:**

- `popups` - Array from `useScorePopup`
- `className` - Additional CSS classes for each popup

**Example:**

```tsx
const { popups, show } = useScorePopup();

return (
  <div className="relative">
    <FloatingText popups={popups} />
    <button onClick={() => show(200, 200, 100)}>+100</button>
  </div>
);
```

## Implementation Patterns

### Pattern 1: Impact Effects (Shake + Particles)

Combine shake and particles for collision feedback.

```tsx
"use client";

import {
  useScreenShake,
  useParticles,
  ScreenShakeContainer,
  ParticleEmitter,
  useSfx,
} from "@/neynar-farcaster-sdk/mini";

export default function ImpactEffectsGame() {
  const { shake, isShaking, offset } = useScreenShake();
  const { particles, emit } = useParticles();
  const { play } = useSfx();

  const handleCollision = (x: number, y: number) => {
    // Shake intensity based on impact
    shake(6, 400);

    // Burst particles at collision point
    emit({
      x,
      y,
      count: 25,
      colors: ["#FF6B6B", "#FFA500", "#FFD700"],
      speed: 300,
      spread: 360, // All directions
      life: 0.8,
    });

    play("impact");
  };

  return (
    <ScreenShakeContainer isShaking={isShaking} offset={offset}>
      <div className="relative w-full h-full">
        <ParticleEmitter particles={particles} />
        <button
          onClick={() => handleCollision(200, 200)}
          className="absolute top-1/2 left-1/2"
        >
          Collide!
        </button>
      </div>
    </ScreenShakeContainer>
  );
}
```

### Pattern 2: Success Celebration (Flash + Particles + Popup)

Layered effects for achievement moments.

```tsx
"use client";

import {
  useFlashEffect,
  useParticles,
  useScorePopup,
  FlashOverlay,
  ParticleEmitter,
  FloatingText,
  useScore,
  useSfx,
} from "@/neynar-farcaster-sdk/mini";

export default function CelebrationEffectsGame() {
  const { flash, isFlashing, flashOpacity, flashColor } = useFlashEffect();
  const { particles, emit } = useParticles();
  const { popups, show } = useScorePopup();
  const { addScore } = useScore();
  const { play } = useSfx();

  const handleSuccess = (x: number, y: number) => {
    // Golden flash
    flash("rgba(255, 215, 0, 0.6)", 500);

    // Confetti explosion
    emit({
      x,
      y,
      count: 50,
      colors: ["#FFD700", "#FFA500", "#FF69B4", "#00CED1"],
      speed: 350,
      spread: 360,
      life: 1.5,
    });

    // Score popup
    show(x, y, 500);

    // Add score
    addScore(500);

    play("success");
  };

  return (
    <div className="relative w-full h-full">
      <ParticleEmitter particles={particles} />
      <FloatingText popups={popups} />
      <FlashOverlay
        isFlashing={isFlashing}
        opacity={flashOpacity}
        color={flashColor}
      />

      <button
        onClick={() => handleSuccess(300, 200)}
        className="absolute top-1/2 left-1/2"
      >
        Success!
      </button>
    </div>
  );
}
```

### Pattern 3: Score Feedback (Popup + Pulse)

Visual feedback when score changes.

```tsx
"use client";

import {
  usePulse,
  useScorePopup,
  FloatingText,
  useScore,
} from "@/neynar-farcaster-sdk/mini";

export default function ScoreFeedbackGame() {
  const { score, addScore } = useScore();
  const { scale } = usePulse(score);
  const { popups, show } = useScorePopup();

  const handleScoreIncrease = (x: number, y: number, amount: number) => {
    show(x, y, amount);
    addScore(amount);
  };

  return (
    <div className="relative w-full h-full p-8">
      <div
        className="text-4xl font-bold mb-8"
        style={{ transform: `scale(${scale})` }}
      >
        Score: {score}
      </div>

      <FloatingText popups={popups} />

      <div className="flex gap-4">
        <button onClick={() => handleScoreIncrease(100, 200, 10)}>+10</button>
        <button onClick={() => handleScoreIncrease(200, 200, 50)}>+50</button>
        <button onClick={() => handleScoreIncrease(300, 200, 100)}>+100</button>
      </div>
    </div>
  );
}
```

### Pattern 4: Combining Multiple Effects

Layered polish for maximum impact.

```tsx
"use client";

import {
  useScreenShake,
  useFlashEffect,
  useParticles,
  useScorePopup,
  ScreenShakeContainer,
  FlashOverlay,
  ParticleEmitter,
  FloatingText,
  useScore,
  useSfx,
} from "@/neynar-farcaster-sdk/mini";

export default function CompleteEffectsGame() {
  const { shake, isShaking, offset } = useScreenShake();
  const { flash, isFlashing, flashOpacity, flashColor } = useFlashEffect();
  const { particles, emit } = useParticles();
  const { popups, show } = useScorePopup();
  const { addScore } = useScore();
  const { play } = useSfx();

  const handleEnemyDefeat = (x: number, y: number) => {
    // Moderate shake
    shake(5, 300);

    // Red flash
    flash("rgba(255, 50, 50, 0.4)", 250);

    // Explosion particles
    emit({
      x,
      y,
      count: 30,
      colors: ["#FF4500", "#FF6347", "#FFA500"],
      speed: 280,
      spread: 360,
    });

    // Score popup
    show(x, y, 100);
    addScore(100);

    play("explosion");
  };

  const handlePowerUpCollect = (x: number, y: number) => {
    // Light shake
    shake(3, 200);

    // Blue flash
    flash("rgba(0, 150, 255, 0.5)", 300);

    // Upward sparkles
    emit({
      x,
      y,
      count: 20,
      colors: ["#00BFFF", "#87CEEB", "#ADD8E6"],
      speed: 200,
      spread: 120,
      angle: -90, // Upward
    });

    play("powerup");
  };

  const handleCriticalHit = (x: number, y: number) => {
    // Heavy shake
    shake(9, 600);

    // White flash
    flash("rgba(255, 255, 255, 0.8)", 400);

    // Large explosion
    emit({
      x,
      y,
      count: 60,
      colors: ["#FFD700", "#FF6347", "#FFA500", "#FFFFFF"],
      speed: 400,
      spread: 360,
      life: 1.2,
    });

    // Large score popup
    show(x, y, 500);
    addScore(500);

    play("critical");
  };

  return (
    <ScreenShakeContainer isShaking={isShaking} offset={offset}>
      <div className="relative w-full h-full bg-gray-900 p-8">
        <ParticleEmitter particles={particles} />
        <FloatingText popups={popups} />
        <FlashOverlay
          isFlashing={isFlashing}
          opacity={flashOpacity}
          color={flashColor}
        />

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleEnemyDefeat(200, 150)}
            className="px-6 py-3 bg-red-600 text-white rounded"
          >
            Enemy Defeat
          </button>

          <button
            onClick={() => handlePowerUpCollect(200, 250)}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Power-Up Collect
          </button>

          <button
            onClick={() => handleCriticalHit(200, 350)}
            className="px-6 py-3 bg-yellow-600 text-white rounded"
          >
            Critical Hit!
          </button>
        </div>
      </div>
    </ScreenShakeContainer>
  );
}
```

### Pattern 5: Performance Optimization (Particle Limits)

Prevent particle overflow with proper limits.

```tsx
"use client";

import { useParticles, ParticleEmitter } from "@/neynar-farcaster-sdk/mini";
import { useRef } from "react";

export default function OptimizedParticlesGame() {
  const { particles, emit, clear } = useParticles();
  const lastEmitRef = useRef<number>(0);
  const MAX_PARTICLES = 100;
  const MIN_EMIT_INTERVAL = 100; // milliseconds

  const emitSafely = (x: number, y: number, count: number) => {
    const now = Date.now();

    // Rate limit emissions
    if (now - lastEmitRef.current < MIN_EMIT_INTERVAL) {
      return;
    }
    lastEmitRef.current = now;

    // Clear old particles if approaching limit
    if (particles.length > MAX_PARTICLES - count) {
      clear();
    }

    emit({ x, y, count });
  };

  const handleRapidFire = (e: React.MouseEvent) => {
    emitSafely(e.clientX, e.clientY, 10);
  };

  return (
    <div
      className="relative w-full h-full bg-gray-900"
      onClick={handleRapidFire}
    >
      <ParticleEmitter particles={particles} />

      <div className="absolute top-4 left-4 text-white">
        Active Particles: {particles.length} / {MAX_PARTICLES}
      </div>

      <div className="absolute top-12 left-4 text-white text-sm">
        Click rapidly anywhere
      </div>
    </div>
  );
}
```

### Pattern 6: Custom Particle Colors/Shapes

Themed particles for different events.

```tsx
"use client";

import { useParticles, ParticleEmitter } from "@/neynar-farcaster-sdk/mini";

export default function CustomParticlesGame() {
  const { particles, emit } = useParticles();

  const emitFire = (x: number, y: number) => {
    emit({
      x,
      y,
      count: 30,
      colors: ["#FF4500", "#FF6347", "#FFA500", "#FFD700"],
      speed: 150,
      spread: 90,
      angle: -90, // Upward
      gravity: -50, // Negative gravity for rising
      life: 1.2,
    });
  };

  const emitWater = (x: number, y: number) => {
    emit({
      x,
      y,
      count: 25,
      colors: ["#00CED1", "#4682B4", "#5F9EA0", "#87CEEB"],
      speed: 200,
      spread: 180,
      angle: 90, // Downward
      gravity: 300, // Heavy fall
      life: 1.0,
    });
  };

  const emitMagic = (x: number, y: number) => {
    emit({
      x,
      y,
      count: 40,
      colors: ["#9370DB", "#BA55D3", "#DA70D6", "#EE82EE"],
      speed: 100,
      spread: 360,
      angle: 0,
      gravity: -80, // Float upward
      life: 2.0,
    });
  };

  const emitElectricity = (x: number, y: number) => {
    emit({
      x,
      y,
      count: 20,
      colors: ["#FFFF00", "#FFFFFF", "#00FFFF"],
      speed: 400,
      spread: 360,
      angle: 0,
      gravity: 50, // Slight fall
      life: 0.5,
    });
  };

  return (
    <div className="relative w-full h-full bg-gray-900 p-8">
      <ParticleEmitter particles={particles} />

      <div className="flex flex-col gap-4">
        <button
          onClick={() => emitFire(200, 300)}
          className="px-6 py-3 bg-orange-600 text-white rounded"
        >
          Fire Effect
        </button>

        <button
          onClick={() => emitWater(200, 100)}
          className="px-6 py-3 bg-blue-600 text-white rounded"
        >
          Water Effect
        </button>

        <button
          onClick={() => emitMagic(200, 200)}
          className="px-6 py-3 bg-purple-600 text-white rounded"
        >
          Magic Effect
        </button>

        <button
          onClick={() => emitElectricity(200, 200)}
          className="px-6 py-3 bg-yellow-400 text-black rounded"
        >
          Electricity Effect
        </button>
      </div>
    </div>
  );
}
```

### Pattern 7: Timing Coordination (Sequence Multiple Effects)

Choreograph effects for dramatic moments.

```tsx
"use client";

import {
  useScreenShake,
  useFlashEffect,
  useParticles,
  useScorePopup,
  ScreenShakeContainer,
  FlashOverlay,
  ParticleEmitter,
  FloatingText,
  useScore,
  useSfx,
} from "@/neynar-farcaster-sdk/mini";

export default function SequencedEffectsGame() {
  const { shake, isShaking, offset } = useScreenShake();
  const { flash, isFlashing, flashOpacity, flashColor } = useFlashEffect();
  const { particles, emit } = useParticles();
  const { popups, show } = useScorePopup();
  const { addScore } = useScore();
  const { play } = useSfx();

  const handleBossDefeat = async (x: number, y: number) => {
    // Stage 1: Initial hit (0ms)
    shake(7, 300);
    flash("rgba(255, 255, 255, 0.6)", 200);
    emit({
      x,
      y,
      count: 30,
      colors: ["#FFFFFF", "#FFD700"],
      speed: 300,
      spread: 360,
    });
    play("hit");

    // Stage 2: Secondary explosion (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));
    shake(9, 500);
    flash("rgba(255, 100, 0, 0.7)", 400);
    emit({
      x,
      y,
      count: 50,
      colors: ["#FF4500", "#FFA500", "#FFD700"],
      speed: 400,
      spread: 360,
      life: 1.5,
    });
    play("explosion");

    // Stage 3: Victory particles (700ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
    emit({
      x,
      y: y - 50,
      count: 60,
      colors: ["#FFD700", "#FFA500", "#FF69B4"],
      speed: 250,
      spread: 180,
      angle: -90,
    });

    // Stage 4: Score reveal (1000ms)
    await new Promise((resolve) => setTimeout(resolve, 300));
    show(x, y - 100, 1000);
    addScore(1000);
    play("victory");

    // Stage 5: Final flash (1200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));
    flash("rgba(255, 215, 0, 0.8)", 600);
  };

  return (
    <ScreenShakeContainer isShaking={isShaking} offset={offset}>
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
        <ParticleEmitter particles={particles} />
        <FloatingText popups={popups} />
        <FlashOverlay
          isFlashing={isFlashing}
          opacity={flashOpacity}
          color={flashColor}
        />

        <button
          onClick={() => handleBossDefeat(300, 200)}
          className="px-8 py-4 bg-red-700 text-white text-xl font-bold rounded"
        >
          DEFEAT BOSS
        </button>
      </div>
    </ScreenShakeContainer>
  );
}
```

### Pattern 8: Cleanup and Memory Management

Proper cleanup to prevent memory leaks.

```tsx
"use client";

import {
  useScreenShake,
  useParticles,
  useScorePopup,
  ScreenShakeContainer,
  ParticleEmitter,
  FloatingText,
  useGameOver,
  useSetGameOver,
} from "@/neynar-farcaster-sdk/mini";
import { useEffect } from "react";

export default function CleanupEffectsGame() {
  const { shake, isShaking, offset } = useScreenShake();
  const { particles, emit, clear: clearParticles } = useParticles();
  const { popups, show } = useScorePopup();
  const isGameOver = useGameOver();
  const setIsGameOver = useSetGameOver();

  const handleGameEnd = () => {
    setIsGameOver(true);
  };

  useEffect(() => {
    if (isGameOver) {
      // Clean up all active effects
      clearParticles();

      // Particles and popups will naturally fade out
      // No manual cleanup needed for score popups
      // Shake will complete its animation naturally
    }
  }, [isGameOver, clearParticles]);

  const handleExplosion = (x: number, y: number) => {
    shake(6, 400);
    emit({
      x,
      y,
      count: 40,
      colors: ["#FF4500", "#FFA500"],
      speed: 300,
      spread: 360,
    });
    show(x, y, 100);
  };

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-4xl font-bold">Game Over</h1>
        <p>All effects cleaned up</p>
        <button
          onClick={() => setIsGameOver(false)}
          className="px-6 py-3 bg-blue-600 text-white rounded"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <ScreenShakeContainer isShaking={isShaking} offset={offset}>
      <div className="relative w-full h-full bg-gray-900 p-8">
        <ParticleEmitter particles={particles} />
        <FloatingText popups={popups} />

        <div className="text-white mb-4">
          Active particles: {particles.length}
        </div>
        <div className="text-white mb-8">Active popups: {popups.length}</div>

        <div className="flex gap-4">
          <button
            onClick={() => handleExplosion(200, 200)}
            className="px-6 py-3 bg-orange-600 text-white rounded"
          >
            Explode
          </button>

          <button
            onClick={handleGameEnd}
            className="px-6 py-3 bg-red-600 text-white rounded"
          >
            End Game (Cleanup)
          </button>
        </div>
      </div>
    </ScreenShakeContainer>
  );
}
```

## Game Juice Best Practices

### Principle 1: Layer Effects

Combine 2-3 effects for major moments:

- Light event: 1 effect (shake OR particles)
- Medium event: 2 effects (shake + particles)
- Major event: 3+ effects (shake + flash + particles + popup)

### Principle 2: Vary Intensity

Scale effect intensity to event importance:

```tsx
// Small coin
shake(2, 150);
emit({ count: 10, speed: 150 });

// Medium power-up
shake(5, 300);
emit({ count: 25, speed: 250 });

// Boss defeat
shake(10, 800);
emit({ count: 60, speed: 400, life: 1.5 });
```

### Principle 3: Match Colors to Context

- **Damage**: Red/orange
- **Success**: Gold/yellow
- **Power-up**: Blue/cyan
- **Healing**: Green
- **Magic**: Purple
- **Critical**: White/bright

### Principle 4: Timing Matters

- Fast feedback: 100-200ms
- Medium impact: 300-500ms
- Major events: 500-1000ms
- Never exceed 1 second

### Principle 5: Performance First

- Limit particles to 100-150 max
- Rate limit rapid emissions
- Clear particles on scene transition
- Test on low-end devices

## Common Combinations

### Damage Feedback

```tsx
const handleDamage = (x: number, y: number, amount: number) => {
  shake(Math.min(10, amount / 2), 300);
  flash("rgba(255, 0, 0, 0.5)", 250);
  show(x, y, -amount);
  play("hurt");
};
```

### Coin Collection

```tsx
const handleCoinCollect = (x: number, y: number) => {
  emit({
    x,
    y,
    count: 15,
    colors: ["#FFD700", "#FFA500"],
    speed: 200,
    spread: 180,
    angle: -90,
  });
  show(x, y, 10);
  play("coin");
};
```

### Enemy Defeat

```tsx
const handleEnemyDefeat = (x: number, y: number) => {
  shake(5, 400);
  flash("rgba(255, 100, 0, 0.4)", 300);
  emit({
    x,
    y,
    count: 30,
    colors: ["#FF4500", "#FF6347", "#FFA500"],
    speed: 280,
    spread: 360,
  });
  show(x, y, 100);
  play("explosion");
};
```

### Level Complete

```tsx
const handleLevelComplete = () => {
  flash("rgba(255, 215, 0, 0.6)", 600);
  emit({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    count: 80,
    colors: ["#FFD700", "#FFA500", "#FF69B4"],
    speed: 400,
    spread: 360,
    life: 2.0,
  });
  play("victory");
};
```

## Related Files

**Source Files:**

- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/effects/use-screen-shake.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/effects/use-particles.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/effects/use-flash-effect.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/effects/use-pulse.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/hooks/effects/use-score-popup.ts`
- `/src/neynar-farcaster-sdk/src/mini/features/game/components/effects/screen-shake-container.tsx`
- `/src/neynar-farcaster-sdk/src/mini/features/game/components/effects/particle-emitter.tsx`
- `/src/neynar-farcaster-sdk/src/mini/features/game/components/effects/flash-overlay.tsx`
- `/src/neynar-farcaster-sdk/src/mini/features/game/components/effects/floating-text.tsx`

**Related APIs:**

- [game-core.llm.md](./game-core.llm.md) - Game initialization and loop
- [game-scoring.llm.md](./game-scoring.llm.md) - Score system integration
- [use-sfx.llm.md](./use-sfx.llm.md) - Audio feedback pairing
