# usePowerUps

**Type**: hook

Power-up management hook (global)

Manages active power-ups with duration timers.
Auto-deactivates when timer expires.
State is shared globally across all components that use this hook.

## Import

```typescript
import { usePowerUps } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function usePowerUps(
  definitions: PowerUpDefinition[],
): UseQueryResult | UseMutationResult;
```

## Parameters

### definitions

- **Type**: `PowerUpDefinition[]`
- **Required**: Yes
- **Description**: No description available

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with active power-ups and control functions

## Usage

```typescript
import { usePowerUps } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = usePowerUps([]);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const powerUps = usePowerUps([
  { id: "shield", name: "Shield", duration: 10000 },
  { id: "speed", name: "Speed Boost", duration: 5000 },
]);

// Activate power-up
powerUps.activate("shield");

// Check if active
if (powerUps.isActive("shield")) {
  // Player is invincible
}
```
