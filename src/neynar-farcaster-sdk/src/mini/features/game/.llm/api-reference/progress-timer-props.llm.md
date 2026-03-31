# ProgressTimerProps

**Type**: type

ProgressTimerProps type

## Type Definition

```typescript
import { ProgressTimerProps } from "@/neynar-farcaster-sdk/game";

type ProgressTimerProps = {
  current: number;
  total: number;
  variant?: "circular" | "linear";
  size?: number;
  format?: "MM:SS" | "MM:SS.mmm" | "seconds";
  className?: string;
};
```

## Type Properties

### current

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### total

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### variant

- **Type**: `"circular" | "linear"`
- **Required**: No
- **Description**: No description available

### size

- **Type**: `number`
- **Required**: No
- **Description**: No description available

### format

- **Type**: `"MM:SS" | "MM:SS.mmm" | "seconds"`
- **Required**: No
- **Description**: No description available

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
