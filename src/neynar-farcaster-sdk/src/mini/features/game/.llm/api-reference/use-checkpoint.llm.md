# useCheckpoint

**Type**: hook

Manual save points system with persistent storage

Stores multiple labeled checkpoints organized by type/category to localStorage.
State is shared globally and persists across page reloads. Perfect for save points
in roguelikes, puzzle games, or any game needing multiple save states organized by
difficulty, mode, campaign, etc.

## Recommended Pattern: Wrap in a Domain-Specific Hook

Instead of using this hook directly, wrap it in a feature-specific hook:

```typescript
// src/features/rpg/use-game-checkpoint.ts
import { useCheckpoint } from "@/neynar-farcaster-sdk/mini";

type GameState = { health: number; score: number };

export function useGameCheckpoint() {
  const {
    saveCheckpoint,
    loadCheckpoint,
    listCheckpoints,
    deleteCheckpoint,
    clearCheckpointType,
  } = useCheckpoint();

  return {
    save: (data: GameState, label?: string) =>
      saveCheckpoint("rpg-game", data, label),
    load: (label: string) => loadCheckpoint<GameState>("rpg-game", label),
    list: () => listCheckpoints("rpg-game"),
    delete: (label: string) => deleteCheckpoint("rpg-game", label),
    clear: () => clearCheckpointType("rpg-game"),
  };
}

// In your component
const checkpoint = useGameCheckpoint();
checkpoint.save({ health: 100, score: 50 }, "before-boss");
const saved = checkpoint.load("before-boss"); // Typed as GameState | null
```

**Benefits:**

- Type string ("rpg-game") defined once
- GameState type enforced automatically
- Simpler API (`.save()` vs `saveCheckpoint()`)
- Clear, focused hook for specific use case

## Storage Structure

Checkpoints are organized as:

```
{
"hard-mode": [checkpoint1, checkpoint2, ...],
"easy-mode": [checkpoint1, checkpoint2, ...],
}
```

Each array maintains chronological order (oldest first, newest last).

## Import

```typescript
import { useCheckpoint } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useCheckpoint(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with checkpoint management functions

## Usage

```typescript
import { useCheckpoint } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useCheckpoint();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic save/load

```typescript
type GameState = { level: number; health: number; coins: number };
const checkpoint = useCheckpoint();

// Save current state to 'campaign' category
checkpoint.saveCheckpoint(
  "campaign",
  { level: 5, health: 100, coins: 50 },
  "before-boss", // optional label
);

// Load specific checkpoint
const saved = checkpoint.loadCheckpoint<GameState>("campaign", "before-boss");
if (saved) {
  // Restore game state
  setGameState(saved);
}

// Load most recent checkpoint (no label)
const latest = checkpoint.loadCheckpoint<GameState>("campaign");
```

### Example 2

Multiple difficulty modes

```typescript
const checkpoint = useCheckpoint();

// Save to different difficulties
checkpoint.saveCheckpoint("easy", gameState, "level-10");
checkpoint.saveCheckpoint("hard", gameState, "level-5");
checkpoint.saveCheckpoint("expert", gameState, "level-3");

// List all save types
const difficulties = checkpoint.listTypes();
// ['easy', 'hard', 'expert']

// List all saves for a difficulty (chronological order)
const hardSaves = checkpoint.listCheckpoints("hard");
// [{ label: 'level-1', timestamp: ..., data: {...} }, ...]
```

### Example 3

Management operations

```typescript
const checkpoint = useCheckpoint();

// Delete specific save
checkpoint.deleteCheckpoint("hard-mode", "before-boss");

// Clear all saves for a category
checkpoint.clearCheckpointType("hard-mode");

// Nuclear option - clear everything
checkpoint.clearAllCheckpoints();
```

### Example 4

Shared across components

```typescript
// Component A - Save game
function SaveButton() {
const checkpoint = useCheckpoint();
const saveGame = () => {
checkpoint.saveCheckpoint('campaign', currentState);
};
return <button onClick={saveGame}>Save</button>;
}

// Component B - Load menu (shares same checkpoints)
function LoadMenu() {
const checkpoint = useCheckpoint();
const saves = checkpoint.listCheckpoints('campaign');
return saves.map(save => (
<button onClick={() => loadGame(save.data)}>
{save.label}
</button>
));
}
```
