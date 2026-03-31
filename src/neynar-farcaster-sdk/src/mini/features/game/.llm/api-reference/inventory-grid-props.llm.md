# InventoryGridProps

**Type**: type

InventoryGridProps type

## Type Definition

```typescript
import { InventoryGridProps } from "@/neynar-farcaster-sdk/game";

type InventoryGridProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  columns?: number;
  onItemClick?: (item: T) => void;
  className?: string;
};
```

## Type Properties

### items

- **Type**: `T[]`
- **Required**: Yes
- **Description**: No description available

### renderItem

- **Type**: `(item: T) => ReactNode`
- **Required**: Yes
- **Description**: No description available

### columns

- **Type**: `number`
- **Required**: No
- **Description**: No description available

### onItemClick

- **Type**: `(item: T) => void`
- **Required**: No
- **Description**: No description available

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
