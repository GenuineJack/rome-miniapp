# shuffle

**Type**: function

Shuffle array (Fisher-Yates algorithm)
Returns new array, doesn't modify original

## API Surface

```typescript
import { shuffle } from '@/neynar-farcaster-sdk/game';

export function shuffle(array: T[]): T[] { ... }
```

## Parameters

### array

- **Type**: `T[]`
- **Required**: Yes
- **Description**: Array to shuffle

## Returns

- **Type**: `T[]`
- **Description**: New shuffled array

## Examples

// Shuffle deck of cards
const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = shuffle(deck);
// Randomize level order
const levels = shuffle(['easy', 'medium', 'hard']);

```

```
