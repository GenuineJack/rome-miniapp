# isMutedAtom

**Type**: function

Global mute state
Persisted to localStorage as 'game-audio-muted'

## API Surface

```typescript
import { isMutedAtom } from "@/neynar-farcaster-sdk/audio";

export const isMutedAtom = atomWithStorage<boolean>("game-audio-muted", false);
```
