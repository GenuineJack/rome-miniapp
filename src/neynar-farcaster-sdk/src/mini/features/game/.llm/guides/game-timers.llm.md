# Game Timer Systems

Guide for implementing countdown and stopwatch mechanics in mini-apps.

## Overview

The game timer system provides high-precision timing utilities with automatic pause integration, singleton animation loops, and flexible display components. All timers use milliseconds internally and integrate with the game's pause system via `isGamePausedAtom`.

## Architecture

### Singleton Pattern with atomEffect

Both countdown and stopwatch use a singleton pattern with `atomEffect` from `jotai-effect`:

```typescript
// Single animation loop shared across all hook instances
const timerEffectAtom = atomEffect((get, set) => {
  const isRunning = get(isRunningAtom);
  const isGamePaused = get(isGamePausedAtom);

  // Don't run if not started or game is paused
  if (!isRunning || isGamePaused) {
    return;
  }

  let frameId: number | undefined;

  const loop = () => {
    // Check pause state each frame
    if (get.peek(isGamePausedAtom)) {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
      return;
    }

    // Update timer state
    // ...

    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
    }
  };
});
```

**Benefits:**

- Single `requestAnimationFrame` loop regardless of hook instances
- Automatic cleanup on unmount
- Pause integration at the loop level
- High precision with RAF

### Automatic Pause Integration

All timers read `isGamePausedAtom` from `src/neynar-farcaster-sdk/src/mini/features/game/private/atoms.ts`:

```typescript
import { isGamePausedAtom } from "../private/atoms";

// Pause check happens every frame
if (get.peek(isGamePausedAtom)) {
  cancelAnimationFrame(frameId);
  return;
}
```

This means timers automatically pause when:

- Player pauses the game via `useGamePaused()`
- Game over state is triggered
- Loading screen is shown
- Any component sets `isGamePausedAtom` to `true`

## API Reference

### useCountdown()

Countdown timer that counts down from a specified duration.

**Location:** `src/neynar-farcaster-sdk/src/mini/features/game/hooks/use-countdown.ts`

**Signature:**

```typescript
function useCountdown(
  seconds: number,
  options?: {
    onComplete?: () => void;
  },
): {
  timeLeft: number; // Milliseconds remaining
  isRunning: boolean; // Whether countdown is active
  start: () => void; // Start from initial time
  pause: () => void; // Pause at current time
  resume: () => void; // Resume from paused time
  reset: () => void; // Reset to initial time (stopped)
};
```

**Parameters:**

- `seconds` - Total duration in seconds (converted to ms internally)
- `options.onComplete` - Callback when countdown reaches 0

**State Management:**

- Global atoms shared across all instances
- `timeLeftAtom` - Current time remaining (milliseconds)
- `isRunningAtom` - Whether countdown is active
- `startTimeAtom` - When current run started (Date.now())
- `pausedTimeAtom` - Time remaining when paused
- `onCompleteCallbackAtom` - Completion callback

**Time Calculation:**

```typescript
// On each frame:
const elapsed = Date.now() - startTime;
const remaining = Math.max(0, pausedTime - elapsed);
```

**Basic Example:**

```typescript
import { useCountdown } from "@/neynar-farcaster-sdk/src/mini/features/game";

function GameTimer() {
  const { timeLeft, isRunning, start, pause, resume, reset } = useCountdown(60, {
    onComplete: () => {
      alert("Time's up!");
    }
  });

  return (
    <div>
      <div>Time: {Math.ceil(timeLeft / 1000)}s</div>
      <button onClick={start}>Start</button>
      <button onClick={pause} disabled={!isRunning}>Pause</button>
      <button onClick={resume} disabled={isRunning}>Resume</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**With Timer Component:**

```typescript
import { useCountdown, Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function GameTimer() {
  const { timeLeft, start } = useCountdown(120, {
    onComplete: () => console.log("Game over!")
  });

  return (
    <div>
      <Timer milliseconds={timeLeft} format="MM:SS" />
      <button onClick={start}>Start Game</button>
    </div>
  );
}
```

### useStopwatch()

Stopwatch timer that counts up from 0.

**Location:** `src/neynar-farcaster-sdk/src/mini/features/game/hooks/use-stopwatch.ts`

**Signature:**

```typescript
function useStopwatch(): {
  elapsed: number; // Milliseconds elapsed
  isRunning: boolean; // Whether stopwatch is active
  start: () => void; // Start from 0
  pause: () => void; // Pause at current time
  resume: () => void; // Resume from paused time
  reset: () => void; // Reset to 0 (stopped)
};
```

**State Management:**

- Global atoms shared across all instances
- `elapsedAtom` - Current elapsed time (milliseconds)
- `isRunningAtom` - Whether stopwatch is active
- `startTimeAtom` - When current run started (Date.now())
- `pausedElapsedAtom` - Elapsed time when paused

**Time Calculation:**

```typescript
// On each frame:
const currentElapsed = pausedElapsed + (Date.now() - startTime);
```

**Basic Example:**

```typescript
import { useStopwatch } from "@/neynar-farcaster-sdk/src/mini/features/game";

function Speedrun() {
  const { elapsed, isRunning, start, pause, reset } = useStopwatch();

  return (
    <div>
      <div>Time: {(elapsed / 1000).toFixed(2)}s</div>
      <button onClick={start}>Start</button>
      <button onClick={pause} disabled={!isRunning}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**With High Precision Display:**

```typescript
import { useStopwatch, Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function SpeedrunTimer() {
  const { elapsed, start, reset } = useStopwatch();

  return (
    <div>
      <Timer milliseconds={elapsed} format="MM:SS.mmm" />
      <button onClick={start}>Start Run</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Timer Component

Presentation component that formats milliseconds into human-readable time.

**Location:** `src/neynar-farcaster-sdk/src/mini/features/game/components/timer.tsx`

**Props:**

```typescript
type TimerProps = {
  milliseconds: number; // Time value
  format?: "MM:SS" | "MM:SS.mmm" | "HH:MM:SS" | "seconds"; // Display format
  className?: string; // CSS classes
};
```

**Format Options:**

- `"MM:SS"` - Minutes and seconds (default): `01:23`
- `"MM:SS.mmm"` - With milliseconds: `01:23.456`
- `"HH:MM:SS"` - Hours, minutes, seconds: `01:23:45`
- `"seconds"` - Total seconds with unit: `83s`

**Time Calculation:**

```typescript
const totalSeconds = Math.ceil(milliseconds / 1000); // Round up
const ms = milliseconds % 1000;
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;
```

**Examples:**

```typescript
import { Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";

// Basic countdown display
<Timer milliseconds={45000} format="MM:SS" />
// Output: "00:45"

// High precision stopwatch
<Timer milliseconds={123456} format="MM:SS.mmm" />
// Output: "02:03.456"

// Long duration
<Timer milliseconds={3723000} format="HH:MM:SS" />
// Output: "01:02:03"

// Simple seconds
<Timer milliseconds={45000} format="seconds" />
// Output: "45s"
```

### ProgressTimer Component

Combines visual progress indicator with time display.

**Location:** `src/neynar-farcaster-sdk/src/mini/features/game/components/progress-timer.tsx`

**Props:**

```typescript
type ProgressTimerProps = {
  current: number; // Current time (ms)
  total: number; // Total time (ms)
  variant?: "circular" | "linear"; // Display style
  size?: number; // Diameter for circular (px)
  format?: "MM:SS" | "MM:SS.mmm" | "seconds"; // Time format
  className?: string; // CSS classes
};
```

**Circular Variant:**

```typescript
import { useCountdown, ProgressTimer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function BossTimer() {
  const { timeLeft, start } = useCountdown(180);

  return (
    <ProgressTimer
      current={timeLeft}
      total={180000}
      variant="circular"
      size={120}
      format="MM:SS"
    />
  );
}
```

**Linear Variant:**

```typescript
import { useCountdown, ProgressTimer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function RoundTimer() {
  const { timeLeft } = useCountdown(30);

  return (
    <ProgressTimer
      current={timeLeft}
      total={30000}
      variant="linear"
      format="MM:SS"
    />
  );
}
```

**Progress Calculation:**

```typescript
const percentage = Math.max(0, Math.min(100, (current / total) * 100));

// For circular: SVG stroke-dashoffset
const circumference = 2 * Math.PI * radius;
const offset = circumference - (percentage / 100) * circumference;
```

### CountdownAnimation Component

Full-screen countdown overlay (3... 2... 1... GO!).

**Location:** `src/neynar-farcaster-sdk/src/mini/features/game/components/countdown-animation.tsx`

**Props:**

```typescript
type CountdownAnimationProps = {
  onComplete: () => void; // Callback when animation completes
  startFrom?: number; // Starting number (default: 3)
  className?: string; // CSS classes
};
```

**Animation Sequence:**

1. Display numbers counting down (1 second each)
2. Show "GO!" message (800ms)
3. Fade out (300ms)
4. Call `onComplete` callback
5. Component can be removed from DOM

**Example:**

```typescript
import { useState } from "react";
import { CountdownAnimation, useCountdown } from "@/neynar-farcaster-sdk/src/mini/features/game";

function Game() {
  const [showCountdown, setShowCountdown] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const countdown = useCountdown(60, {
    onComplete: () => alert("Game over!")
  });

  function handleCountdownComplete() {
    setShowCountdown(false);
    setGameStarted(true);
    countdown.start();
  }

  return (
    <>
      {showCountdown && (
        <CountdownAnimation
          onComplete={handleCountdownComplete}
          startFrom={3}
        />
      )}

      {gameStarted && (
        <div>
          <Timer milliseconds={countdown.timeLeft} />
          {/* Game content */}
        </div>
      )}
    </>
  );
}
```

**Custom Start Number:**

```typescript
// Quick start (2, 1, GO!)
<CountdownAnimation startFrom={2} onComplete={startGame} />

// Extended countdown (5, 4, 3, 2, 1, GO!)
<CountdownAnimation startFrom={5} onComplete={startGame} />
```

## Common Patterns

### Pattern 1: Countdown with Completion Callback

Time-limited game round with automatic completion.

```typescript
import { useCountdown, Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function TimedRound() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const { timeLeft, isRunning, start, reset } = useCountdown(60, {
    onComplete: () => {
      setGameOver(true);
      console.log("Final score:", score);
    }
  });

  function handleStart() {
    setScore(0);
    setGameOver(false);
    start();
  }

  return (
    <div>
      <Timer milliseconds={timeLeft} format="MM:SS" />
      <div>Score: {score}</div>

      {!isRunning && !gameOver && (
        <button onClick={handleStart}>Start Game</button>
      )}

      {gameOver && (
        <div>
          <div>Game Over! Final Score: {score}</div>
          <button onClick={handleStart}>Play Again</button>
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Speedrun Stopwatch

Track completion time for speedruns.

```typescript
import { useStopwatch, Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function SpeedrunGame() {
  const [bestTime, setBestTime] = useState<number | null>(null);
  const { elapsed, isRunning, start, reset } = useStopwatch();

  function handleLevelComplete() {
    if (bestTime === null || elapsed < bestTime) {
      setBestTime(elapsed);
    }
    reset();
  }

  return (
    <div>
      <div>Current Time:</div>
      <Timer milliseconds={elapsed} format="MM:SS.mmm" />

      {bestTime !== null && (
        <div>
          Best Time: <Timer milliseconds={bestTime} format="MM:SS.mmm" />
        </div>
      )}

      {!isRunning && (
        <button onClick={start}>Start Level</button>
      )}

      {isRunning && (
        <button onClick={handleLevelComplete}>Complete Level</button>
      )}
    </div>
  );
}
```

### Pattern 3: Progress Bar Visualization

Visual countdown with progress bar.

```typescript
import { useCountdown, ProgressTimer } from "@/neynar-farcaster-sdk/src/mini/features/game";

function BossEncounter() {
  const BOSS_TIMER = 180; // 3 minutes

  const { timeLeft, start } = useCountdown(BOSS_TIMER, {
    onComplete: () => {
      alert("Boss fled! You win!");
    }
  });

  return (
    <div>
      <h2>Defeat the Boss!</h2>

      {/* Circular progress timer */}
      <ProgressTimer
        current={timeLeft}
        total={BOSS_TIMER * 1000}
        variant="circular"
        size={150}
        format="MM:SS"
      />

      <button onClick={start}>Start Encounter</button>
    </div>
  );
}
```

### Pattern 4: Pause/Resume Handling

Manual pause control with automatic game pause integration.

```typescript
import { useCountdown, Timer, useGamePaused } from "@/neynar-farcaster-sdk/src/mini/features/game";

function GameWithPause() {
  const countdown = useCountdown(120);
  const { isPaused, pause, resume } = useGamePaused();

  function handlePauseToggle() {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }

  return (
    <div>
      <Timer milliseconds={countdown.timeLeft} format="MM:SS" />

      {countdown.isRunning && (
        <button onClick={handlePauseToggle}>
          {isPaused ? "Resume" : "Pause"}
        </button>
      )}

      {!countdown.isRunning && (
        <button onClick={countdown.start}>Start</button>
      )}

      {/* Timer automatically pauses when isPaused is true */}
    </div>
  );
}
```

### Pattern 5: Countdown Animation + Game Timer

Pre-game countdown followed by game timer.

```typescript
import {
  CountdownAnimation,
  useCountdown,
  ProgressTimer
} from "@/neynar-farcaster-sdk/src/mini/features/game";
import { useState } from "react";

function FullGame() {
  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const gameTimer = useCountdown(90, {
    onComplete: () => {
      alert("Time's up!");
    }
  });

  function handleIntroComplete() {
    setShowIntro(false);
    setGameStarted(true);
    gameTimer.start();
  }

  return (
    <>
      {showIntro && (
        <CountdownAnimation
          onComplete={handleIntroComplete}
          startFrom={3}
        />
      )}

      {gameStarted && (
        <div>
          <ProgressTimer
            current={gameTimer.timeLeft}
            total={90000}
            variant="linear"
            format="MM:SS"
          />

          {/* Game content */}
        </div>
      )}
    </>
  );
}
```

### Pattern 6: Multiple Timers (Boss Phases)

Different timers for different game phases.

```typescript
import { useCountdown, Timer } from "@/neynar-farcaster-sdk/src/mini/features/game";
import { useState } from "react";

function BossPhases() {
  const [phase, setPhase] = useState(1);

  const phase1Timer = useCountdown(60, {
    onComplete: () => setPhase(2)
  });

  const phase2Timer = useCountdown(45, {
    onComplete: () => setPhase(3)
  });

  const phase3Timer = useCountdown(30, {
    onComplete: () => alert("Boss defeated!")
  });

  function startFight() {
    setPhase(1);
    phase1Timer.start();
  }

  return (
    <div>
      <div>Boss Phase {phase}</div>

      {phase === 1 && (
        <div>
          <Timer milliseconds={phase1Timer.timeLeft} format="MM:SS" />
          {!phase1Timer.isRunning && (
            <button onClick={startFight}>Start Fight</button>
          )}
        </div>
      )}

      {phase === 2 && (
        <div>
          <Timer milliseconds={phase2Timer.timeLeft} format="MM:SS" />
          {!phase2Timer.isRunning && phase2Timer.start()}
        </div>
      )}

      {phase === 3 && (
        <div>
          <Timer milliseconds={phase3Timer.timeLeft} format="MM:SS" />
          {!phase3Timer.isRunning && phase3Timer.start()}
        </div>
      )}
    </div>
  );
}
```

## Time Precision

### Milliseconds vs Seconds

All timers use **milliseconds** internally for precision:

```typescript
// Input is in seconds
const countdown = useCountdown(60); // 60 seconds

// Output is in milliseconds
countdown.timeLeft // 60000, 59876, 59752, etc.

// Display as seconds
Math.ceil(countdown.timeLeft / 1000) // 60, 60, 60, 59, 59, etc.

// Or use Timer component
<Timer milliseconds={countdown.timeLeft} format="MM:SS" />
```

### High Precision Display

For speedruns, show milliseconds:

```typescript
const { elapsed } = useStopwatch();

// High precision
<Timer milliseconds={elapsed} format="MM:SS.mmm" />
// Output: "01:23.456"

// Manual formatting
const seconds = (elapsed / 1000).toFixed(3);
// Output: "83.456"
```

### Frame Rate Considerations

Timers use `requestAnimationFrame` (~60fps):

- Updates every ~16ms
- Visual smoothness for progress bars
- Millisecond precision maintained
- No drift over time (based on `Date.now()`)

## Display Format Guide

### MM:SS Format

Standard countdown/stopwatch display.

```typescript
<Timer milliseconds={123000} format="MM:SS" />
// Output: "02:03"

<Timer milliseconds={59999} format="MM:SS" />
// Output: "01:00" (rounds up to nearest second)
```

**Use cases:**

- Standard game timers
- Round duration
- Cooldown displays

### MM:SS.mmm Format

High precision with milliseconds.

```typescript
<Timer milliseconds={123456} format="MM:SS.mmm" />
// Output: "02:03.456"
```

**Use cases:**

- Speedruns
- Racing games
- Precision timing challenges

### HH:MM:SS Format

Long duration display.

```typescript
<Timer milliseconds={3723000} format="HH:MM:SS" />
// Output: "01:02:03"
```

**Use cases:**

- Marathon sessions
- Campaign timers
- Long boss fights

### Seconds Format

Simple seconds with unit.

```typescript
<Timer milliseconds={45000} format="seconds" />
// Output: "45s"
```

**Use cases:**

- Cooldown timers
- Quick reference
- Ability recharge

## Integration with Game Pause

All timers automatically integrate with `isGamePausedAtom`:

```typescript
import { useGamePaused } from "@/neynar-farcaster-sdk/src/mini/features/game";

function Game() {
  const { isPaused, pause, resume } = useGamePaused();
  const countdown = useCountdown(60);

  // When isPaused is true, countdown automatically stops updating
  // When resume() is called, countdown continues from where it left off

  return (
    <div>
      <Timer milliseconds={countdown.timeLeft} />
      <button onClick={isPaused ? resume : pause}>
        {isPaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}
```

**Automatic pause triggers:**

- `useGamePaused()` pause/resume
- Game over state
- Loading screens
- Modal dialogs (if they set `isGamePausedAtom`)

## Performance Considerations

### Singleton Animation Loop

Only one `requestAnimationFrame` loop runs regardless of hook instances:

```typescript
// These all share the same animation loop
function Component1() {
  const countdown = useCountdown(60);
  return <Timer milliseconds={countdown.timeLeft} />;
}

function Component2() {
  const countdown = useCountdown(60); // Same global state!
  return <div>{Math.ceil(countdown.timeLeft / 1000)}s</div>;
}

function Component3() {
  const countdown = useCountdown(60); // Same global state!
  return <ProgressTimer current={countdown.timeLeft} total={60000} />;
}
```

**Important:** All instances share the same timer state. If you need independent timers, you'll need to create separate atoms or track state locally.

### Memory and CPU

- Single RAF loop: ~0.1% CPU usage
- No memory leaks (automatic cleanup)
- No timer drift (uses `Date.now()`)
- Pauses when tab is inactive (RAF behavior)

## Common Gotchas

### Global State Sharing

All instances of `useCountdown()` share the same state:

```typescript
// ❌ This won't work as expected
function Game() {
  const timer1 = useCountdown(60);
  const timer2 = useCountdown(30); // Same atoms as timer1!

  timer1.start(); // Both timers will show the same value!
}
```

**Solution:** Use one timer per game, or create separate atom sets.

### Time Display Rounding

`Math.ceil()` is used for seconds display:

```typescript
// timeLeft = 59001ms
Math.ceil(59001 / 1000); // 60 seconds

// timeLeft = 59999ms
Math.ceil(59999 / 1000); // 60 seconds

// timeLeft = 59000ms
Math.ceil(59000 / 1000); // 59 seconds
```

Use `Timer` component for consistent formatting.

### onComplete Callback Updates

Set callback in `useEffect` to avoid stale closures:

```typescript
// ✅ Correct
const countdown = useCountdown(60, {
  onComplete: () => {
    console.log("Score:", score); // Current score value
  },
});

// onComplete callback updates when dependencies change
```

### Manual Pause vs Auto Pause

```typescript
const countdown = useCountdown(60);
const { isPaused, pause } = useGamePaused();

// Manual pause
countdown.pause(); // Timer shows isRunning = false

// Automatic pause
pause(); // Timer still shows isRunning = true, but stops updating

// To manually pause, use countdown.pause()
// To use game-wide pause, use useGamePaused()
```

## Testing Timers

### Mock Time

```typescript
import { act } from "@testing-library/react";

test("countdown completes", async () => {
  const onComplete = jest.fn();
  const { result } = renderHook(() => useCountdown(1, { onComplete }));

  act(() => {
    result.current.start();
  });

  // Wait for completion
  await waitFor(
    () => {
      expect(onComplete).toHaveBeenCalled();
    },
    { timeout: 2000 },
  );
});
```

### Fast-forward Time

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("countdown decrements", () => {
  const { result } = renderHook(() => useCountdown(10));

  act(() => {
    result.current.start();
  });

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(result.current.timeLeft).toBeLessThan(10000);
});
```
