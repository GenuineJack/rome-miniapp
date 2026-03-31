# randomChoice

**Type**: function

Pick random element from array

## API Surface

```typescript
import { randomChoice } from '@/neynar-farcaster-sdk/game';

export function randomChoice(array: T[]): T { ... }
```

## Parameters

### array

- **Type**: `T[]`
- **Required**: Yes
- **Description**: Array to pick from

## Returns

- **Type**: `T`
- **Description**: Random element from the array

## Examples

// Pick random color
const color = randomChoice(['red', 'blue', 'green']);
// Pick random enemy type
const enemy = randomChoice(enemyTypes);

```

```
