# InventoryGrid

**Type**: component

Inventory grid component

Visual inventory display with grid layout and custom item rendering.
Supports item click handling.

## JSX Usage

```jsx
import { InventoryGrid } from '@/neynar-farcaster-sdk/game';

<InventoryGrid
  items={value}
  renderItem={value}
  columns=4
  onItemClick={handleItemClick}
  className=""
/>
```

## Component Props

### items

- **Type**: `unknown`
- **Required**: Yes
- **Description**: No description available

### renderItem

- **Type**: `unknown`
- **Required**: Yes
- **Description**: No description available

### columns

- **Type**: `unknown`
- **Required**: No
- **Description**: No description available
- **Default**: 4

### onItemClick

- **Type**: `unknown`
- **Required**: Yes
- **Description**: No description available

### className

- **Type**: `unknown`
- **Required**: No
- **Description**: No description available
- **Default**: ""

## Examples

const inventory = useInventory<Item>();
<InventoryGrid
items={inventory.items}
columns={4}
renderItem={(item) => (

<div>{item.name}</div>
)}
onItemClick={(item) => console.log('Clicked:', item)}
/>

```

```
