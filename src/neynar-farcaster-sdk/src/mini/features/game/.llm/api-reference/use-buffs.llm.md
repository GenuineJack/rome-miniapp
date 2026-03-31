# useBuffs

**Type**: hook

Temporary stat buffs/debuffs hook (global)

Tracks temporary stat modifiers with automatic expiration.
Calculates combined multipliers for stacking buffs.
State is shared globally across all components that use this hook.

## Import

```typescript
import { useBuffs } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useBuffs(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with active buffs and management functions

## Usage

```typescript
import { useBuffs } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useBuffs();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const buffs = useBuffs();

// Apply damage buff
buffs.applyBuff({
  id: "rage",
  type: "positive",
  stat: "damage",
  modifier: 2.0,
  duration: 5000,
});

// Get combined modifier
const damageMultiplier = buffs.getModifier("damage");
const damage = baseDamage * damageMultiplier;
```
