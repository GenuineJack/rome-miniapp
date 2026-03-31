# BuffIcon

**Type**: component

Buff icon component

Displays buff/debuff icons with progress ring showing time remaining.
Color-coded: green for positive buffs, red for negative debuffs.

## JSX Usage

```jsx
import { BuffIcon } from '@/neynar-farcaster-sdk/game';

<BuffIcon
  buffs={[]}
  maxDisplay=5
  className=""
/>
```

## Component Props

### buffs

- **Type**: `Buff[]`
- **Required**: Yes
- **Description**: No description available

### maxDisplay

- **Type**: `number`
- **Required**: No
- **Description**: No description available
- **Default**: 5

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: ""

## Examples

const buffs = useBuffs();
<BuffIcon buffs={buffs.activeBuffs} maxDisplay={5} />

```

```
