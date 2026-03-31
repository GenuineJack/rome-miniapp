# sfxVolumeAtom

**Type**: function

Sound effects volume (0.0 - 1.0)
Persisted to localStorage as 'game-sfx-volume'

## API Surface

```typescript
import { sfxVolumeAtom } from "@/neynar-farcaster-sdk/audio";

export const sfxVolumeAtom = atomWithStorage<number>("game-sfx-volume", 0.7);
```
