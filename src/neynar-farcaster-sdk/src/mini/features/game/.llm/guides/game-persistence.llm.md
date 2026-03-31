# Game Persistence & Save Systems

Comprehensive guide to implementing persistent storage, save systems, and checkpoints in Neynar mini-apps.

## Overview

The Neynar SDK provides two complementary persistence systems:

1. **`useLocalStorageState`** - Simple persistent state (like `useState` but saved to localStorage)
2. **`useCheckpoint`** - Multi-checkpoint save system with labels and categories

Both systems:

- Persist data across page reloads
- Use Jotai's `atomWithStorage` for reactive state management
- Automatically serialize/deserialize JSON
- Share state globally across components
- Namespace keys to avoid conflicts

---

## Core Concepts

### Namespace Prefix

All localStorage keys are automatically prefixed with `neynar-miniapp:` to prevent conflicts:

```typescript
useLocalStorageState("high-score", 0);
// Stored as: "neynar-miniapp:high-score"
```

### Automatic Serialization

Data is stored as JSON and automatically parsed:

```typescript
const [settings, setSettings] = useLocalStorageState("settings", {
  volume: 0.5,
  difficulty: "normal",
});
// Stored as: '{"volume":0.5,"difficulty":"normal"}'
```

### Global State Sharing

State is shared across all components using the same key:

```typescript
// Component A
const [score, setScore] = useLocalStorageState("score", 0);
setScore(100);

// Component B - automatically sees the update
const [score] = useLocalStorageState("score", 0);
console.log(score); // 100
```

---

## API Reference

### `useLocalStorageState<T>(key, initialValue)`

Persistent state hook that works like `useState` but syncs to localStorage.

**Parameters:**

- `key: string` - Storage key (will be namespaced)
- `initialValue: T` - Default value if no stored value exists

**Returns:**

- `[value: T, setValue: (value: T | ((prev: T) => T)) => void]`

**Key Features:**

- Works with any JSON-serializable type
- Supports functional updates like `useState`
- Automatically syncs across components
- Memoized to prevent unnecessary rerenders

**Example:**

```typescript
const [highScore, setHighScore] = useLocalStorageState("high-score", 0);

// Direct update
setHighScore(150);

// Functional update
setHighScore((prev) => prev + 10);
```

---

### `useCheckpoint()`

Multi-checkpoint save system with categories, labels, and timestamps.

**Returns object with methods:**

#### `saveCheckpoint(type, data, label?)`

Save data to a specific category with optional label.

**Parameters:**

- `type: string` - Category/type identifier (e.g., 'campaign', 'hard-mode')
- `data: unknown` - Any JSON-serializable data
- `label?: string` - Optional label (defaults to ISO timestamp)

```typescript
checkpoint.saveCheckpoint("campaign", gameState, "before-boss");
```

#### `loadCheckpoint<T>(type, label?)`

Load checkpoint data from a category.

**Parameters:**

- `type: string` - Category to load from
- `label?: string` - Specific checkpoint label (omit for most recent)

**Returns:** `T | null`

```typescript
const saved = checkpoint.loadCheckpoint<GameState>("campaign", "before-boss");
if (saved) {
  restoreGameState(saved);
}
```

#### `listCheckpoints(type)`

Get all checkpoints for a category in chronological order.

**Parameters:**

- `type: string` - Category to list

**Returns:** `CheckpointInfo[]`

```typescript
type CheckpointInfo = {
  label: string;
  timestamp: number;
  data: unknown;
};

const saves = checkpoint.listCheckpoints("campaign");
// [{ label: 'level-1', timestamp: 1234567890, data: {...} }, ...]
```

#### `listTypes()`

Get all checkpoint categories.

**Returns:** `string[]`

```typescript
const categories = checkpoint.listTypes();
// ['campaign', 'hard-mode', 'speedrun']
```

#### `deleteCheckpoint(type, label)`

Delete a specific checkpoint.

```typescript
checkpoint.deleteCheckpoint("campaign", "before-boss");
```

#### `clearCheckpointType(type)`

Delete all checkpoints in a category.

```typescript
checkpoint.clearCheckpointType("hard-mode");
```

#### `clearAllCheckpoints()`

Nuclear option - delete all checkpoints across all categories.

```typescript
checkpoint.clearAllCheckpoints();
```

---

## Storage Structure

### useLocalStorageState

Simple key-value storage:

```
localStorage:
  "neynar-miniapp:high-score" → "150"
  "neynar-miniapp:settings" → '{"volume":0.5,"difficulty":"normal"}'
  "neynar-miniapp:level" → "5"
```

### useCheckpoint

Hierarchical structure organized by type:

```
localStorage:
  "game-checkpoints" → {
    "campaign": [
      { label: "level-1", timestamp: 1234567890, data: {...} },
      { label: "level-5", timestamp: 1234567900, data: {...} }
    ],
    "hard-mode": [
      { label: "checkpoint-1", timestamp: 1234567910, data: {...} }
    ]
  }
```

---

## Pattern 1: High Score Persistence

Simple persistent high score that survives page reloads.

```typescript
// src/features/game/use-high-score.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";

export function useHighScore() {
  return useLocalStorageState<number>("high-score", 0);
}

// In your game component
import { useHighScore } from "@/features/game/use-high-score";

function Game() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useHighScore();

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore, setHighScore]);

  return (
    <div>
      <div>Score: {score}</div>
      <div>High Score: {highScore}</div>
    </div>
  );
}
```

**Benefits:**

- Automatically persists across sessions
- No manual localStorage API calls
- Type-safe with TypeScript
- Shared across all components

---

## Pattern 2: User Preferences Persistence

Save user settings like volume, difficulty, theme, etc.

```typescript
// src/features/game/use-game-settings.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";

type GameSettings = {
  volume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  theme: 'light' | 'dark';
  soundEnabled: boolean;
};

const DEFAULT_SETTINGS: GameSettings = {
  volume: 0.5,
  difficulty: 'normal',
  theme: 'light',
  soundEnabled: true,
};

export function useGameSettings() {
  return useLocalStorageState<GameSettings>("game-settings", DEFAULT_SETTINGS);
}

// In your settings component
import { useGameSettings } from "@/features/game/use-game-settings";

function SettingsMenu() {
  const [settings, setSettings] = useGameSettings();

  const updateVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume }));
  };

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  return (
    <div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={settings.volume}
        onChange={(e) => updateVolume(parseFloat(e.target.value))}
      />
      <button onClick={toggleSound}>
        Sound: {settings.soundEnabled ? 'ON' : 'OFF'}
      </button>
      <select
        value={settings.difficulty}
        onChange={(e) => setSettings(prev => ({
          ...prev,
          difficulty: e.target.value as GameSettings['difficulty']
        }))}
      >
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  );
}
```

**Best Practices:**

- Define a clear type for settings structure
- Provide sensible defaults
- Use functional updates to merge partial changes
- Wrap in domain-specific hook

---

## Pattern 3: Multi-Checkpoint Save System

Full save/load system with multiple save slots for roguelike or RPG games.

```typescript
// src/features/rpg/use-game-checkpoint.ts
import { useCheckpoint } from "@/neynar-farcaster-sdk/mini";

type GameState = {
  level: number;
  health: number;
  maxHealth: number;
  coins: number;
  inventory: string[];
  position: { x: number; y: number };
};

export function useGameCheckpoint() {
  const checkpoint = useCheckpoint();

  return {
    save: (data: GameState, label?: string) =>
      checkpoint.saveCheckpoint("rpg-game", data, label),

    load: (label: string) =>
      checkpoint.loadCheckpoint<GameState>("rpg-game", label),

    loadLatest: () =>
      checkpoint.loadCheckpoint<GameState>("rpg-game"),

    list: () =>
      checkpoint.listCheckpoints("rpg-game"),

    delete: (label: string) =>
      checkpoint.deleteCheckpoint("rpg-game", label),

    clear: () =>
      checkpoint.clearCheckpointType("rpg-game"),
  };
}

// In your game component
import { useGameCheckpoint } from "@/features/rpg/use-game-checkpoint";

function RPGGame() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    coins: 0,
    inventory: [],
    position: { x: 0, y: 0 },
  });

  const checkpoint = useGameCheckpoint();

  const handleSave = () => {
    const label = `level-${gameState.level}-${Date.now()}`;
    checkpoint.save(gameState, label);
  };

  const handleLoad = (label: string) => {
    const saved = checkpoint.load(label);
    if (saved) {
      setGameState(saved);
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save Game</button>
      <SaveSlotList
        saves={checkpoint.list()}
        onLoad={handleLoad}
        onDelete={checkpoint.delete}
      />
    </div>
  );
}

// Save slot UI component
function SaveSlotList({ saves, onLoad, onDelete }) {
  return (
    <div>
      <h3>Load Game</h3>
      {saves.length === 0 ? (
        <p>No saved games</p>
      ) : (
        saves.map(save => (
          <div key={save.label}>
            <span>{save.label}</span>
            <span>{new Date(save.timestamp).toLocaleString()}</span>
            <button onClick={() => onLoad(save.label)}>Load</button>
            <button onClick={() => onDelete(save.label)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
```

**Features:**

- Multiple save slots
- Chronological ordering
- Timestamp tracking
- Easy save/load/delete operations

---

## Pattern 4: Game Progress Tracking

Track player progress through levels, unlocked items, achievements, etc.

```typescript
// src/features/game/use-game-progress.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";

type GameProgress = {
  currentLevel: number;
  maxLevelReached: number;
  unlockedItems: string[];
  completedAchievements: string[];
  totalPlayTime: number; // in seconds
};

const DEFAULT_PROGRESS: GameProgress = {
  currentLevel: 1,
  maxLevelReached: 1,
  unlockedItems: [],
  completedAchievements: [],
  totalPlayTime: 0,
};

export function useGameProgress() {
  const [progress, setProgress] = useLocalStorageState<GameProgress>(
    "game-progress",
    DEFAULT_PROGRESS
  );

  const unlockItem = (itemId: string) => {
    setProgress(prev => ({
      ...prev,
      unlockedItems: [...prev.unlockedItems, itemId],
    }));
  };

  const completeAchievement = (achievementId: string) => {
    setProgress(prev => ({
      ...prev,
      completedAchievements: [...prev.completedAchievements, achievementId],
    }));
  };

  const advanceLevel = () => {
    setProgress(prev => {
      const newLevel = prev.currentLevel + 1;
      return {
        ...prev,
        currentLevel: newLevel,
        maxLevelReached: Math.max(newLevel, prev.maxLevelReached),
      };
    });
  };

  const updatePlayTime = (secondsPlayed: number) => {
    setProgress(prev => ({
      ...prev,
      totalPlayTime: prev.totalPlayTime + secondsPlayed,
    }));
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  return {
    progress,
    unlockItem,
    completeAchievement,
    advanceLevel,
    updatePlayTime,
    resetProgress,
  };
}

// In your game
import { useGameProgress } from "@/features/game/use-game-progress";

function LevelComplete() {
  const { progress, advanceLevel, completeAchievement } = useGameProgress();

  const handleLevelComplete = () => {
    advanceLevel();

    if (progress.currentLevel === 10) {
      completeAchievement('reach-level-10');
    }
  };

  return (
    <div>
      <h2>Level {progress.currentLevel} Complete!</h2>
      <p>Max Level Reached: {progress.maxLevelReached}</p>
      <p>Achievements: {progress.completedAchievements.length}</p>
      <button onClick={handleLevelComplete}>Next Level</button>
    </div>
  );
}
```

**Use Cases:**

- Track progression through levels
- Unlock system for items/characters
- Achievement tracking
- Play time statistics
- Persistent campaign state

---

## Pattern 5: Loading Saved State on Mount

Automatically restore game state when component mounts.

```typescript
// src/features/game/use-auto-save-game.ts
import { useEffect } from "react";
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";

type GameState = {
  level: number;
  score: number;
  lives: number;
};

const DEFAULT_STATE: GameState = {
  level: 1,
  score: 0,
  lives: 3,
};

export function useAutoSaveGame() {
  const [gameState, setGameState] = useLocalStorageState<GameState>(
    "auto-save",
    DEFAULT_STATE
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // State is already persisted via useLocalStorageState
      console.log('Auto-saved game state');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return [gameState, setGameState] as const;
}

// In your game component
import { useAutoSaveGame } from "@/features/game/use-auto-save-game";

function Game() {
  const [gameState, setGameState] = useAutoSaveGame();

  // Game automatically loads last saved state on mount
  // and saves automatically as state changes

  return (
    <div>
      <div>Level: {gameState.level}</div>
      <div>Score: {gameState.score}</div>
      <div>Lives: {gameState.lives}</div>
    </div>
  );
}
```

**Checkpoint-based auto-restore:**

```typescript
// src/features/game/use-auto-restore.ts
import { useEffect, useState } from "react";
import { useCheckpoint } from "@/neynar-farcaster-sdk/mini";

type GameState = {
  level: number;
  health: number;
  position: { x: number; y: number };
};

export function useAutoRestoreGame() {
  const checkpoint = useCheckpoint();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-restore on mount
  useEffect(() => {
    const saved = checkpoint.loadCheckpoint<GameState>("campaign");
    if (saved) {
      setGameState(saved);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save on unmount or every minute
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      checkpoint.saveCheckpoint("campaign", gameState, "auto-save");
    }, 60000);

    return () => {
      clearInterval(interval);
      checkpoint.saveCheckpoint("campaign", gameState, "auto-save");
    };
  }, [gameState]);

  return { gameState, setGameState, isLoaded };
}
```

**Loading Screen Pattern:**

```typescript
function GameWithLoading() {
  const { gameState, setGameState, isLoaded } = useAutoRestoreGame();

  if (!isLoaded) {
    return <div>Loading saved game...</div>;
  }

  if (!gameState) {
    return <NewGameSetup onStart={setGameState} />;
  }

  return <Game state={gameState} setState={setGameState} />;
}
```

---

## Pattern 6: Handling Corrupted/Missing Data

Robust error handling for localStorage failures and corrupted data.

```typescript
// src/features/game/use-safe-persistent-state.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";
import { useEffect, useState } from "react";

type GameData = {
  level: number;
  score: number;
};

function validateGameData(data: unknown): data is GameData {
  return (
    typeof data === "object" &&
    data !== null &&
    "level" in data &&
    "score" in data &&
    typeof (data as GameData).level === "number" &&
    typeof (data as GameData).score === "number"
  );
}

export function useSafePersistentState() {
  const [gameData, setGameData] = useLocalStorageState<GameData | null>(
    "game-data",
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (gameData !== null && !validateGameData(gameData)) {
        console.error("Invalid game data detected, resetting...");
        setGameData(null);
        setError("Save data was corrupted and has been reset");
      }
    } catch (err) {
      console.error("Error validating game data:", err);
      setGameData(null);
      setError("Failed to load save data");
    }
  }, [gameData]);

  const safeSetGameData = (data: GameData) => {
    if (validateGameData(data)) {
      setGameData(data);
      setError(null);
    } else {
      setError("Invalid game data format");
    }
  };

  return { gameData, setGameData: safeSetGameData, error };
}
```

**Migration Pattern:**

```typescript
// src/features/game/use-versioned-state.ts
import { useLocalStorageState } from "@/neynar-farcaster-sdk/mini";
import { useEffect } from "react";

type GameDataV1 = {
  version: 1;
  level: number;
};

type GameDataV2 = {
  version: 2;
  level: number;
  score: number;
};

type GameData = GameDataV2;

const CURRENT_VERSION = 2;

function migrateGameData(data: unknown): GameData {
  if (!data || typeof data !== "object") {
    return { version: CURRENT_VERSION, level: 1, score: 0 };
  }

  const versionedData = data as { version?: number };

  // Migrate V1 to V2
  if (versionedData.version === 1) {
    const v1Data = versionedData as GameDataV1;
    return {
      version: 2,
      level: v1Data.level,
      score: 0, // New field in V2
    };
  }

  // Already V2
  if (versionedData.version === 2) {
    return versionedData as GameDataV2;
  }

  // Unknown version, reset
  return { version: CURRENT_VERSION, level: 1, score: 0 };
}

export function useVersionedGameData() {
  const [rawData, setRawData] = useLocalStorageState<unknown>(
    "versioned-game-data",
    null,
  );

  const gameData = migrateGameData(rawData);

  useEffect(() => {
    if (rawData === null || (rawData as any)?.version !== CURRENT_VERSION) {
      setRawData(gameData);
    }
  }, []);

  const setGameData = (data: GameData) => {
    setRawData(data);
  };

  return [gameData, setGameData] as const;
}
```

**Checkpoint Validation:**

```typescript
// src/features/game/use-validated-checkpoint.ts
import { useCheckpoint } from "@/neynar-farcaster-sdk/mini";
import { z } from "zod";

const GameStateSchema = z.object({
  level: z.number().min(1).max(100),
  health: z.number().min(0).max(100),
  score: z.number().min(0),
  inventory: z.array(z.string()),
});

type GameState = z.infer<typeof GameStateSchema>;

export function useValidatedCheckpoint() {
  const checkpoint = useCheckpoint();

  const safeSave = (data: GameState, label?: string) => {
    try {
      const validated = GameStateSchema.parse(data);
      checkpoint.saveCheckpoint("game", validated, label);
      return { success: true, error: null };
    } catch (error) {
      console.error("Invalid game state:", error);
      return { success: false, error: "Invalid game state" };
    }
  };

  const safeLoad = (label?: string): GameState | null => {
    try {
      const data = checkpoint.loadCheckpoint("game", label);
      if (!data) return null;

      return GameStateSchema.parse(data);
    } catch (error) {
      console.error("Corrupted save data:", error);

      // Optionally delete corrupted checkpoint
      if (label) {
        checkpoint.deleteCheckpoint("game", label);
      }

      return null;
    }
  };

  return {
    save: safeSave,
    load: safeLoad,
    list: () => checkpoint.listCheckpoints("game"),
    delete: (label: string) => checkpoint.deleteCheckpoint("game", label),
  };
}
```

---

## Error Handling Strategies

### 1. Graceful Degradation

```typescript
function Game() {
  const [highScore, setHighScore] = useLocalStorageState('high-score', 0);

  // Game works even if localStorage fails
  // State just won't persist
  return <div>High Score: {highScore}</div>;
}
```

### 2. User Notification

```typescript
function GameWithNotification() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.getItem('test');
    } catch (err) {
      setError('Unable to save game progress (localStorage disabled)');
    }
  }, []);

  return (
    <div>
      {error && <div className="warning">{error}</div>}
      <Game />
    </div>
  );
}
```

### 3. Fallback Storage

```typescript
// Fallback to memory if localStorage unavailable
const [state, setState] = useState(() => {
  try {
    return useLocalStorageState("key", defaultValue);
  } catch {
    return useState(defaultValue);
  }
});
```

---

## Best Practices

### 1. Wrap in Domain-Specific Hooks

Always create feature-specific hooks instead of using persistence hooks directly:

```typescript
// Good
export function useHighScore() {
  return useLocalStorageState<number>("high-score", 0);
}

// Bad - using directly in components
function Game() {
  const [score, setScore] = useLocalStorageState("high-score", 0);
}
```

### 2. Define Clear Types

Use TypeScript to enforce data structure:

```typescript
type SaveData = {
  level: number;
  health: number;
  inventory: string[];
};

const [save, setSave] = useLocalStorageState<SaveData>(...);
```

### 3. Validate Data

Always validate loaded data, especially for complex types:

```typescript
function isValidSaveData(data: unknown): data is SaveData {
  return (
    typeof data === "object" &&
    data !== null &&
    "level" in data &&
    typeof data.level === "number"
  );
}
```

### 4. Handle Migration

Plan for data structure changes:

```typescript
function migrateData(oldData: OldFormat): NewFormat {
  return {
    ...oldData,
    newField: defaultValue,
  };
}
```

### 5. Use Descriptive Keys

Make storage keys clear and specific:

```typescript
// Good
"puzzle-game-progress";
"rpg-campaign-save";
"racing-highscores";

// Bad
"data";
"save";
"state";
```

### 6. Consider Storage Limits

localStorage typically has a 5-10MB limit. For large data:

```typescript
// Check storage usage
const estimate = await navigator.storage?.estimate();
console.log(`Used: ${estimate?.usage}, Quota: ${estimate?.quota}`);

// Compress large data or use selective persistence
```

### 7. Don't Store Sensitive Data

Never store passwords, tokens, or PII in localStorage:

```typescript
// Bad
const [password, setPassword] = useLocalStorageState("password", "");

// Good - only store non-sensitive game data
const [preferences, setPreferences] = useLocalStorageState("prefs", {});
```

---

## Common Pitfalls

1. **Forgetting to validate loaded data** - Always validate before using
2. **Storing too much data** - Be mindful of 5MB localStorage limit
3. **Not handling version changes** - Plan for data migration
4. **Exposing sensitive information** - Never store credentials
5. **Excessive saves** - Avoid saving on every render (use debouncing)
6. **Not testing localStorage unavailable** - Handle incognito/disabled localStorage

---

## Summary

The Neynar SDK provides two persistence systems:

- **`useLocalStorageState`** - Simple persistent state for settings, scores, preferences
- **`useCheckpoint`** - Multi-save checkpoint system for game saves and complex state

Both automatically handle serialization, global state sharing, and localStorage management, making persistence trivial to implement in your mini-app games.
