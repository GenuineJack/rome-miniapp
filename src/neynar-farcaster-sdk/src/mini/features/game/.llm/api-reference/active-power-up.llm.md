# ActivePowerUp

**Type**: type

ActivePowerUp type

## Type Definition

```typescript
import { ActivePowerUp } from "@/neynar-farcaster-sdk/game";

type ActivePowerUp = PowerUpDefinition & {
  activatedAt: number;
  expiresAt: number;
  timeRemaining: number;
};
```
