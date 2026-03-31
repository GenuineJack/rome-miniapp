# Game Scoring Systems

## Overview

Complete guide to implementing score, combo, and streak systems. Covers basic point tracking, multiplier mechanics, consecutive action rewards, and animated visual feedback. All systems use Jotai atoms for global state management and integrate seamlessly with game initialization.

## Prerequisites

- Read `game-core.llm.md` first to understand `useInitializeGame` and game configuration
- Familiarity with React hooks and state management

## APIs Covered

- **useScore()** - Core score tracking with add, subtract, set, and reset operations
- **useCombo()** - Combo multiplier system with auto-reset timeout
- **useStreak()** - Win/loss streak tracking with best streak memory
- **ScoreDisplay** - Animated score counter with smooth count-up animation
- **ComboIndicator** - Visual combo feedback with pulse effects and color transitions

---

## Complete API Reference

### useScore()

**Purpose**: Track player score globally with helper functions for common operations.

**Signature**:

```typescript
function useScore(): {
  score: number;
  setScore: (value: number) => void;
  addScore: (amount: number) => void;
  subtractScore: (amount: number) => void;
  resetScore: () => void;
};
```

**Returns**:

- `score` - Current score value (number)
- `setScore(value)` - Set score to exact value
- `addScore(amount)` - Add points to current score
- `subtractScore(amount)` - Remove points (respects `allowNegativeScore` config)
- `resetScore()` - Reset score to 0

**Configuration**:
Score behavior is controlled by `allowNegativeScore` in game config (set via `useInitializeGame`):

- `allowNegativeScore: false` (default) - Score cannot go below 0
- `allowNegativeScore: true` - Score can be negative

**Usage - Basic Scoring**:

```tsx
import { useInitializeGame, useScore } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { score, addScore, resetScore } = useScore();

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {
      action: { handler: () => addScore(10), keys: ["Space"] },
    },
  });

  return (
    <div>
      <div>Score: {score}</div>
      <button onClick={resetScore}>Reset</button>
    </div>
  );
}
```

**Usage - With Negative Score**:

```tsx
import { useInitializeGame, useScore } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { score, addScore, subtractScore } = useScore();

  useInitializeGame({
    config: { allowNegativeScore: true },
    actions: {
      action: { handler: () => addScore(10), keys: ["Space"] },
    },
  });

  function handleDamage() {
    subtractScore(25); // Can go negative
  }

  return (
    <div>
      <div>Score: {score}</div>
      <button onClick={handleDamage}>Take Damage</button>
    </div>
  );
}
```

---

### useCombo()

**Purpose**: Track consecutive actions with multiplier rewards and auto-reset timeout.

**Signature**:

```typescript
function useCombo(): {
  combo: number;
  multiplier: number;
  addCombo: () => void;
  resetCombo: () => void;
  setMaxComboTime: (ms: number) => void;
  setMultiplierFn: (fn: (combo: number) => number) => void;
};
```

**Returns**:

- `combo` - Current combo count (0 = no combo)
- `multiplier` - Current multiplier value (calculated from combo count)
- `addCombo()` - Increment combo and restart timeout
- `resetCombo()` - Reset combo to 0 and clear timeout
- `setMaxComboTime(ms)` - Configure timeout window (default: 1000ms)
- `setMultiplierFn(fn)` - Customize multiplier calculation (default: linear)

**Multiplier Modes**:

**Linear** (default):

```typescript
(combo) => Math.max(1, combo);
// combo 0 = 1x, combo 1 = 1x, combo 2 = 2x, combo 3 = 3x, etc.
```

**Tiered**:

```typescript
(combo) => {
  if (combo < 5) return 1; // 1x for combos 0-4
  if (combo < 10) return 2; // 2x for combos 5-9
  if (combo < 20) return 3; // 3x for combos 10-19
  return 5; // 5x for combos 20+
};
```

**Exponential**:

```typescript
(combo) => Math.min(10, Math.floor(Math.pow(2, combo / 5)));
// Rapid growth with cap at 10x
// combo 0-4: 1x, combo 5-9: 2x, combo 10-14: 4x, combo 15-19: 8x, combo 20+: 10x
```

**Usage - Basic Linear Combo**:

```tsx
import { useCombo } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { combo, multiplier, addCombo, resetCombo } = useCombo();

  function handleAction() {
    addCombo();
    const points = 10 * multiplier;
    console.log(`+${points} points (${combo}x combo)`);
  }

  return (
    <div>
      <div>
        Combo: {combo} (x{multiplier})
      </div>
      <button onClick={handleAction}>Action</button>
      <button onClick={resetCombo}>Reset Combo</button>
    </div>
  );
}
```

**Usage - Custom Tiered Multiplier**:

```tsx
import { useCombo } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { combo, multiplier, addCombo, setMaxComboTime, setMultiplierFn } =
    useCombo();

  // Configure once (e.g., in useInitializeGame or useEffect)
  React.useEffect(() => {
    setMaxComboTime(2000); // 2 second window between actions

    // Tiered multiplier: rewards sustained combos
    setMultiplierFn((combo) => {
      if (combo < 5) return 1;
      if (combo < 10) return 2;
      if (combo < 20) return 3;
      return 5;
    });
  }, [setMaxComboTime, setMultiplierFn]);

  return (
    <div>
      <div>
        Combo: {combo} (x{multiplier})
      </div>
    </div>
  );
}
```

**Usage - Exponential with Cap**:

```tsx
import { useCombo } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { setMultiplierFn } = useCombo();

  React.useEffect(() => {
    // Exponential growth, capped at 10x
    setMultiplierFn((combo) =>
      Math.min(10, Math.floor(Math.pow(2, combo / 5))),
    );
  }, [setMultiplierFn]);

  return <div>Game content...</div>;
}
```

**Timeout Behavior**:

- Combo resets to 0 if no action occurs within the configured time window
- Default window: 1000ms (1 second)
- Each `addCombo()` call restarts the timeout
- Timeout cleanup is managed automatically (safe to mount/unmount components)

---

### useStreak()

**Purpose**: Track win/loss streaks and record best streak achieved.

**Signature**:

```typescript
function useStreak(): {
  streak: number;
  bestStreak: number;
  addWin: () => void;
  addLoss: () => void;
  resetStreak: () => void;
};
```

**Returns**:

- `streak` - Current win streak count
- `bestStreak` - Best streak ever achieved (persists until reset)
- `addWin()` - Increment streak, update best if exceeded
- `addLoss()` - Reset streak to 0, preserve best streak
- `resetStreak()` - Reset both streak and best streak to 0

**Usage - Basic Win/Loss Tracking**:

```tsx
import { useStreak } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { streak, bestStreak, addWin, addLoss, resetStreak } = useStreak();

  function handleRoundEnd(playerWon: boolean) {
    if (playerWon) {
      addWin(); // Increment streak
    } else {
      addLoss(); // Reset to 0, keep bestStreak
    }
  }

  return (
    <div>
      <div>Current Streak: {streak}</div>
      <div>Best Streak: {bestStreak}</div>
      <button onClick={resetStreak}>Reset All</button>
    </div>
  );
}
```

**Usage - Streak-Based Rewards**:

```tsx
import { useStreak, useScore } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { streak, addWin, addLoss } = useStreak();
  const { addScore } = useScore();

  function handleRoundEnd(playerWon: boolean) {
    if (playerWon) {
      addWin();

      // Bonus points for streak milestones
      if (streak > 0 && streak % 5 === 0) {
        addScore(100); // Bonus every 5 wins
      }
    } else {
      addLoss();
    }
  }

  return (
    <div>
      <div>Win Streak: {streak}</div>
      {streak > 0 && streak % 5 === 0 && (
        <div className="text-yellow-400">STREAK BONUS!</div>
      )}
    </div>
  );
}
```

---

### ScoreDisplay Component

**Purpose**: Animated score counter with smooth count-up animation and scale effect.

**Signature**:

```typescript
type ScoreDisplayProps = {
  value: number;
  duration?: number;
  className?: string;
};

function ScoreDisplay(props: ScoreDisplayProps): JSX.Element;
```

**Props**:

- `value` - Current score to display (number)
- `duration` - Animation duration in milliseconds (default: 500)
- `className` - Additional CSS classes for styling

**Animation**:

- Uses ease-out cubic easing for smooth deceleration
- Scales up 10% during animation, returns to 100% when complete
- Formats numbers with locale-appropriate separators (e.g., "1,000")

**Usage - Basic Display**:

```tsx
import { useScore, ScoreDisplay } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { score } = useScore();

  return (
    <ScoreDisplay value={score} className="text-4xl font-bold text-white" />
  );
}
```

**Usage - Custom Animation Speed**:

```tsx
import { useScore, ScoreDisplay } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { score } = useScore();

  return (
    <div>
      {/* Fast animation for quick feedback */}
      <ScoreDisplay
        value={score}
        duration={300}
        className="text-2xl font-bold"
      />

      {/* Slower animation for dramatic effect */}
      <ScoreDisplay
        value={score}
        duration={1000}
        className="text-6xl font-black"
      />
    </div>
  );
}
```

---

### ComboIndicator Component

**Purpose**: Visual combo feedback with pulse animation and color transitions.

**Signature**:

```typescript
type ComboIndicatorProps = {
  combo: number;
  multiplier: number;
  show?: boolean;
  className?: string;
};

function ComboIndicator(props: ComboIndicatorProps): JSX.Element | null;
```

**Props**:

- `combo` - Current combo count (number)
- `multiplier` - Current multiplier value (number)
- `show` - Force show/hide (optional, overrides auto-show behavior)
- `className` - Additional CSS classes for styling

**Behavior**:

- Automatically shows when `combo > 0`, hides when `combo === 0`
- Pulses (scales to 125%) when multiplier increases
- Color transitions based on multiplier:
  - Blue (`text-blue-400`) for multiplier 1-2
  - Yellow (`text-yellow-400`) for multiplier 3-4
  - Purple (`text-purple-400`) for multiplier 5+
- Displays text: `{multiplier}x COMBO!`
- Adds glow effect with `text-shadow`

**Usage - Basic Combo Display**:

```tsx
import { useCombo, ComboIndicator } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { combo, multiplier } = useCombo();

  return (
    <div className="relative">
      <ComboIndicator
        combo={combo}
        multiplier={multiplier}
        className="absolute top-4 right-4"
      />
    </div>
  );
}
```

**Usage - Custom Visibility Control**:

```tsx
import { useCombo, ComboIndicator } from "@/neynar-farcaster-sdk/game";

function MyGame() {
  const { combo, multiplier } = useCombo();
  const [showCombo, setShowCombo] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShowCombo(!showCombo)}>
        Toggle Combo Display
      </button>

      <ComboIndicator combo={combo} multiplier={multiplier} show={showCombo} />
    </div>
  );
}
```

---

## Implementation Patterns

### Pattern 1: Basic Scoring Game

**Problem**: Simple game where player earns points for actions.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  ScoreDisplay,
} from "@/neynar-farcaster-sdk/game";

function BasicScoringGame() {
  const { score, addScore, resetScore } = useScore();

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {
      action: {
        handler: () => addScore(10),
        keys: ["Space", "Enter"],
      },
    },
  });

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <ScoreDisplay value={score} className="text-5xl font-bold text-white" />

      <div className="text-lg text-gray-400">
        Press SPACE or tap ACTION to score
      </div>

      <button onClick={resetScore} className="px-4 py-2 bg-blue-500 rounded">
        New Game
      </button>
    </div>
  );
}
```

---

### Pattern 2: Score with Linear Combo

**Problem**: Reward consecutive actions with increasing points.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  useCombo,
  ScoreDisplay,
  ComboIndicator,
} from "@/neynar-farcaster-sdk/game";

function LinearComboGame() {
  const { score, addScore, resetScore } = useScore();
  const { combo, multiplier, addCombo, resetCombo } = useCombo();

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {
      action: {
        handler: () => {
          addCombo(); // Increment combo
          const points = 10 * multiplier;
          addScore(points);
        },
        keys: ["Space"],
      },
    },
  });

  function handleReset() {
    resetScore();
    resetCombo();
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <ScoreDisplay value={score} className="text-5xl font-bold text-white" />

      <ComboIndicator combo={combo} multiplier={multiplier} />

      <div className="text-lg text-gray-400">
        Combo x{multiplier} | Keep going for more points!
      </div>

      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

**Expected Behavior**:

- First action: +10 points (1x multiplier)
- Second action (within 1s): +20 points (2x multiplier)
- Third action (within 1s): +30 points (3x multiplier)
- If 1s passes with no action: combo resets to 0

---

### Pattern 3: Tiered Combo System

**Problem**: Create combo milestones with significant multiplier jumps.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  useCombo,
  ScoreDisplay,
  ComboIndicator,
} from "@/neynar-farcaster-sdk/game";
import { useEffect } from "react";

function TieredComboGame() {
  const { score, addScore } = useScore();
  const { combo, multiplier, addCombo, setMaxComboTime, setMultiplierFn } =
    useCombo();

  // Configure combo system once
  useEffect(() => {
    setMaxComboTime(1500); // 1.5 second window

    // Tiered multiplier with clear thresholds
    setMultiplierFn((combo) => {
      if (combo < 5) return 1; // 1x: Learning phase
      if (combo < 10) return 2; // 2x: Getting good
      if (combo < 20) return 3; // 3x: On fire
      if (combo < 50) return 5; // 5x: Unstoppable
      return 10; // 10x: God mode
    });
  }, [setMaxComboTime, setMultiplierFn]);

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {
      action: {
        handler: () => {
          addCombo();
          addScore(10 * multiplier);
        },
        keys: ["Space"],
      },
    },
  });

  // Helper to determine combo tier name
  function getComboTier(combo: number): string {
    if (combo < 5) return "Warming Up";
    if (combo < 10) return "Getting Good";
    if (combo < 20) return "On Fire";
    if (combo < 50) return "Unstoppable";
    return "GOD MODE";
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <ScoreDisplay value={score} className="text-6xl font-bold text-white" />

      <ComboIndicator
        combo={combo}
        multiplier={multiplier}
        className="text-3xl"
      />

      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-400">
          {getComboTier(combo)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {combo < 5 && "Keep going! Reach 5 for 2x"}
          {combo >= 5 && combo < 10 && "Nice! Reach 10 for 3x"}
          {combo >= 10 && combo < 20 && "Amazing! Reach 20 for 5x"}
          {combo >= 20 && combo < 50 && "Incredible! Reach 50 for 10x"}
          {combo >= 50 && "MAXIMUM COMBO!"}
        </div>
      </div>
    </div>
  );
}
```

**Milestones**:

- 0-4 combo: 1x multiplier ("Warming Up")
- 5-9 combo: 2x multiplier ("Getting Good")
- 10-19 combo: 3x multiplier ("On Fire")
- 20-49 combo: 5x multiplier ("Unstoppable")
- 50+ combo: 10x multiplier ("GOD MODE")

---

### Pattern 4: Win/Loss Streak with Bonus Rewards

**Problem**: Track consecutive wins and award milestone bonuses.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  useStreak,
  ScoreDisplay,
} from "@/neynar-farcaster-sdk/game";

function StreakBonusGame() {
  const { score, addScore } = useScore();
  const { streak, bestStreak, addWin, addLoss } = useStreak();

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {},
  });

  function handleRoundEnd(playerWon: boolean) {
    if (playerWon) {
      addWin();
      addScore(100); // Base win reward

      // Milestone bonuses
      if (streak > 0 && streak % 5 === 0) {
        const bonus = streak * 50;
        addScore(bonus);
        console.log(`🎉 STREAK BONUS: +${bonus}`);
      }
    } else {
      addLoss();
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <ScoreDisplay value={score} className="text-5xl font-bold text-white" />

      <div className="flex gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-400">{streak}</div>
          <div className="text-sm text-gray-400">Current Streak</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-yellow-400">{bestStreak}</div>
          <div className="text-sm text-gray-400">Best Streak</div>
        </div>
      </div>

      {streak > 0 && streak % 5 === 0 && (
        <div className="text-xl font-bold text-yellow-400 animate-pulse">
          🔥 STREAK BONUS! 🔥
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => handleRoundEnd(true)}
          className="px-6 py-3 bg-green-500 rounded font-bold"
        >
          Win Round
        </button>
        <button
          onClick={() => handleRoundEnd(false)}
          className="px-6 py-3 bg-red-500 rounded font-bold"
        >
          Lose Round
        </button>
      </div>

      <div className="text-sm text-gray-400">
        {streak >= 5
          ? `Next bonus at ${Math.ceil(streak / 5) * 5} wins`
          : `Bonus at 5 wins`}
      </div>
    </div>
  );
}
```

**Rewards**:

- Every win: +100 base points
- 5-win streak: +250 bonus (5 × 50)
- 10-win streak: +500 bonus (10 × 50)
- 15-win streak: +750 bonus (15 × 50)
- Loss: Streak resets, best streak preserved

---

### Pattern 5: Combined Score, Combo, and Streak

**Problem**: Integrate all scoring systems for maximum engagement.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  useCombo,
  useStreak,
  ScoreDisplay,
  ComboIndicator,
} from "@/neynar-farcaster-sdk/game";
import { useEffect } from "react";

function UltimateGame() {
  const { score, addScore, resetScore } = useScore();
  const { combo, multiplier, addCombo, resetCombo, setMultiplierFn } =
    useCombo();
  const { streak, bestStreak, addWin, addLoss, resetStreak } = useStreak();

  // Configure exponential combo with cap
  useEffect(() => {
    setMultiplierFn((combo) =>
      Math.min(10, Math.floor(Math.pow(2, combo / 5))),
    );
  }, [setMultiplierFn]);

  useInitializeGame({
    config: { allowNegativeScore: false },
    actions: {
      action: {
        handler: () => {
          addCombo();
          const basePoints = 10;
          const comboPoints = basePoints * multiplier;
          const streakBonus = streak * 5; // +5 per streak level
          const totalPoints = comboPoints + streakBonus;

          addScore(totalPoints);
        },
        keys: ["Space"],
      },
    },
  });

  function handleRoundEnd(playerWon: boolean) {
    if (playerWon) {
      addWin();
      addScore(1000); // Win bonus
    } else {
      addLoss();
      resetCombo(); // Penalty: lose combo
    }
  }

  function handleFullReset() {
    resetScore();
    resetCombo();
    resetStreak();
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <ScoreDisplay value={score} className="text-6xl font-bold text-white" />

      <ComboIndicator
        combo={combo}
        multiplier={multiplier}
        className="text-2xl"
      />

      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-3xl font-bold text-blue-400">{combo}</div>
          <div className="text-sm text-gray-400">Combo</div>
        </div>
        <div className="bg-gray-800 p-4 rounded text-center">
          <div className="text-3xl font-bold text-green-400">{streak}</div>
          <div className="text-sm text-gray-400">Win Streak</div>
        </div>
      </div>

      <div className="text-center text-gray-400">
        <div>
          Base: 10 × Combo x{multiplier} = {10 * multiplier}
        </div>
        <div>
          Streak Bonus: {streak} × 5 = +{streak * 5}
        </div>
        <div className="font-bold text-white mt-2">
          Total per Action: {10 * multiplier + streak * 5}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleRoundEnd(true)}
          className="px-6 py-3 bg-green-500 rounded font-bold"
        >
          Win Round
        </button>
        <button
          onClick={() => handleRoundEnd(false)}
          className="px-6 py-3 bg-red-500 rounded font-bold"
        >
          Lose Round
        </button>
      </div>

      <button
        onClick={handleFullReset}
        className="px-4 py-2 bg-gray-600 rounded text-sm"
      >
        Full Reset
      </button>

      <div className="text-xs text-gray-500">Best Streak: {bestStreak}</div>
    </div>
  );
}
```

**Scoring Formula**:

- Action points: `10 × multiplier(combo)` (exponential combo)
- Streak bonus: `streak × 5` (passive bonus per action)
- Round win bonus: `+1000` points
- Round loss penalty: Combo resets (lose multiplier)

**Example Progression**:

1. First action (combo=1, streak=0): 10 × 1 + 0 = 10 points
2. Second action (combo=2, streak=0): 10 × 1 + 0 = 10 points
3. Win round (combo=2, streak=1): +1000 bonus
4. Third action (combo=3, streak=1): 10 × 1 + 5 = 15 points
5. Sixth action (combo=6, streak=1): 10 × 2 + 5 = 25 points (multiplier jumps to 2x)

---

### Pattern 6: Negative Score Mechanics

**Problem**: Implement penalties that can put player in debt.

**Solution**:

```tsx
import {
  useInitializeGame,
  useScore,
  ScoreDisplay,
} from "@/neynar-farcaster-sdk/game";

function NegativeScoreGame() {
  const { score, addScore, subtractScore, resetScore } = useScore();

  useInitializeGame({
    config: { allowNegativeScore: true }, // Allow negative scores
    actions: {
      action: {
        handler: () => addScore(50),
        keys: ["Space"],
      },
    },
  });

  function handlePenalty(amount: number) {
    subtractScore(amount);
  }

  // Color based on score
  const scoreColor =
    score < 0 ? "text-red-400" : score > 100 ? "text-green-400" : "text-white";

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div>
        <div className="text-sm text-gray-400 text-center mb-2">
          {score < 0 && "IN DEBT - Earn points to recover!"}
          {score >= 0 && score < 100 && "Keep earning!"}
          {score >= 100 && "POSITIVE BALANCE!"}
        </div>
        <ScoreDisplay
          value={score}
          className={`text-6xl font-bold ${scoreColor}`}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handlePenalty(25)}
          className="px-4 py-2 bg-yellow-600 rounded"
        >
          Minor Penalty (-25)
        </button>
        <button
          onClick={() => handlePenalty(100)}
          className="px-4 py-2 bg-red-600 rounded"
        >
          Major Penalty (-100)
        </button>
      </div>

      <button onClick={resetScore}>Reset to 0</button>

      <div className="text-xs text-gray-500">
        Press SPACE to earn +50 points
      </div>
    </div>
  );
}
```

**Behavior with `allowNegativeScore: true`**:

- Score can go below 0
- Useful for debt/loan mechanics
- Risk/reward gameplay
- Player must "pay off" penalties

**Behavior with `allowNegativeScore: false`** (default):

- Score stops at 0
- `subtractScore(1000)` on score of 50 results in 0, not -950
- Useful for traditional games where negative score doesn't make sense

---

## Common Combinations

When building scoring systems, you often need:

- **Timers**: See `game-timers.llm.md` for countdown/stopwatch integration
- **Visual Effects**: See `game-effects.llm.md` for score popups, particle effects, and screen shake
- **Persistence**: See `game-persistence.llm.md` for saving high scores
- **Audio Feedback**: See `audio-system.llm.md` for combo sound effects
- **Game Core**: See `game-core.llm.md` for initialization and state management

---

## Related Files

- **game-core.llm.md** - Game initialization and configuration (required reading)
- **game-timers.llm.md** - Time-limited scoring scenarios
- **game-effects.llm.md** - Visual feedback for score/combo changes
- **game-persistence.llm.md** - Saving high scores and best streaks
- **audio-system.llm.md** - Sound effects for scoring events
