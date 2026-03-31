# weightedRandom

**Type**: function

Pick item based on weights

## API Surface

```typescript
import { weightedRandom } from '@/neynar-farcaster-sdk/game';

export function weightedRandom(items: { value: T; weight: number }[]): T { ... }
```

## Parameters

### items

- **Type**: `{ value: T; weight: number }[]`
- **Required**: Yes
- **Description**: Array of items with weight values

## Returns

- **Type**: `T`
- **Description**: Random item based on weighted probability

## Examples

// Loot drop system
const loot = weightedRandom([
{ value: 'common', weight: 70 },
{ value: 'rare', weight: 25 },
{ value: 'legendary', weight: 5 }
]);
// Returns 'common' ~70% of the time, 'rare' ~25%, 'legendary' ~5%
// Enemy spawn rates
const enemy = weightedRandom([
{ value: 'goblin', weight: 50 },
{ value: 'orc', weight: 30 },
{ value: 'dragon', weight: 1 }
]);

```

```
