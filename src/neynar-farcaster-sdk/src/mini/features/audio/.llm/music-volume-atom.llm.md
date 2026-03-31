# musicVolumeAtom

**Type**: function

Music volume (0.0 - 1.0)
Persisted to localStorage as 'game-music-volume'

## API Surface

```typescript
import { musicVolumeAtom } from "@/neynar-farcaster-sdk/audio";

export const musicVolumeAtom = atomWithStorage<number>(
  "game-music-volume",
  0.5,
);
```
