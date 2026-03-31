# ComboIndicator

**Type**: component

Shows combo multiplier with pulse animation

Displays "2x COMBO!", "3x COMBO!", etc. with a pulse effect when the
combo increases. Automatically hides when combo is 0.

## JSX Usage

```jsx
import { ComboIndicator } from "@/neynar-farcaster-sdk/game";

<ComboIndicator combo={0} multiplier={0} show={true} className="" />;
```

## Component Props

### combo

- **Type**: `number`
- **Required**: Yes
- **Description**: Current combo count

### multiplier

- **Type**: `number`
- **Required**: Yes
- **Description**: Current multiplier value

### show

- **Type**: `boolean`
- **Required**: No
- **Description**: Force show/hide (overrides auto-show behavior)

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { combo, multiplier } = useCombo(1000);
<ComboIndicator combo={combo} multiplier={multiplier} />

```

```
