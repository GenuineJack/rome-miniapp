# useCombo

**Type**: hook

Combo multiplier system for consecutive actions (global)

Tracks consecutive actions and builds a multiplier. Auto-resets if no action
occurs within the specified time window. State is shared globally across all
components that use this hook.

## Configuration

- `setMaxComboTime(ms)` - Set timeout window (default: 1000ms)
- `setMultiplierFn(fn)` - Customize multiplier calculation (default: linear)

## Multiplier Modes

- **Linear**: `(combo) => Math.max(1, combo)` - Multiplier equals combo count
- **Tiered**: Jumps at thresholds (e.g., 1x → 2x

## Import

```typescript
import { useCombo } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useCombo(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with combo state and control functions

## Usage

```typescript
import { useCombo } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useCombo();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic usage - Linear multiplier

```typescript
const { combo, multiplier, addCombo, resetCombo } = useCombo();

// Player performs action
addCombo();
const points = 10 * multiplier; // 10, 20, 30, 40...

// Combo resets automatically after 1 second of inactivity
```

### Example 2

Configuration - Tiered multiplier

```typescript
// In initialization (e.g., useInitializeGame)
const { setMaxComboTime, setMultiplierFn } = useCombo();

setMaxComboTime(2000); // 2 second window between actions

// Tiered multiplier: rewards sustained combos
setMultiplierFn((combo) => {
  if (combo < 5) return 1; // 1x for combos 0-4
  if (combo < 10) return 2; // 2x for combos 5-9
  if (combo < 20) return 3; // 3x for combos 10-19
  return 5; // 5x for combos 20+
});
```

### Example 3

Exponential multiplier with cap

```typescript
const { setMultiplierFn } = useCombo();

// Exponential growth, capped at 10x
setMultiplierFn((combo) => Math.min(10, Math.floor(Math.pow(2, combo / 5))));
// combo 0-4:   1x
// combo 5-9:   2x
// combo 10-14: 4x
// combo 15-19: 8x
// combo 20+:   10x (capped)
```

### Example 4

Usage across multiple components

```typescript
// Component A - Build combo
function GamePlay() {
const { addCombo } = useCombo();
return <button onClick={addCombo}>Hit!</button>;
}

// Component B - Display combo (shares same state)
function ComboDisplay() {
const { combo, multiplier } = useCombo();
return <div>Combo: {combo} (x{multiplier})</div>;
}
```
