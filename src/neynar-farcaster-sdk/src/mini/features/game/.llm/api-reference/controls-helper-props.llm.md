# ControlsHelperProps

**Type**: type

ControlsHelperProps type

## Type Definition

```typescript
import { ControlsHelperProps } from "@/neynar-farcaster-sdk/game";

type ControlsHelperProps = {
  controls: {
    key: string;
    label: string;
    description: string;
  }[];
  visible: boolean;
  onClose?: () => void;
};
```

## Type Properties

### controls

- **Type**: `{
  key: string;
  label: string;
  description: string;
}[]`
- **Required**: Yes
- **Description**: No description available

### visible

- **Type**: `boolean`
- **Required**: Yes
- **Description**: No description available

### onClose

- **Type**: `() => void`
- **Required**: No
- **Description**: No description available
