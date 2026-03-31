# gameConfigAtom

**Type**: function

Global game configuration atom
Shared state that game hooks (like useScore) need to read

## API Surface

```typescript
import { gameConfigAtom } from "@/neynar-farcaster-sdk/game";

export const gameConfigAtom = atom<GameConfig>({
  allowNegativeScore: false,
});
```
