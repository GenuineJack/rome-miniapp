# Buff

**Type**: type

Buff type

## Type Definition

```typescript
import { Buff } from "@/neynar-farcaster-sdk/game";

type Buff = {
  id: string;
  type: "positive" | "negative";
  stat: string;
  modifier: number;
  duration: number;
  icon?: string;
  activatedAt?: number;
  expiresAt?: number;
  timeRemaining?: number;
};
```

## Type Properties

### id

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### type

- **Type**: `"positive" | "negative"`
- **Required**: Yes
- **Description**: No description available

### stat

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### modifier

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### duration

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### icon

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### activatedAt

- **Type**: `number`
- **Required**: No
- **Description**: No description available

### expiresAt

- **Type**: `number`
- **Required**: No
- **Description**: No description available

### timeRemaining

- **Type**: `number`
- **Required**: No
- **Description**: No description available
