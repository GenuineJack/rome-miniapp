# ControlsHelper

**Type**: component

Keyboard/touch control overlay component

Shows list of keyboard/touch controls in a semi-transparent overlay.
Formatted like "Arrow Keys - Move player".

## JSX Usage

```jsx
import { ControlsHelper } from "@/neynar-farcaster-sdk/game";

<ControlsHelper controls={[]} visible={true} onClose={handleClose} />;
```

## Component Props

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

## Examples

<ControlsHelper
visible={showControls}
onClose={() => setShowControls(false)}
controls={[
{ key: 'Arrow Keys', label: 'Move', description: 'Move player' },
{ key: 'Space', label: 'Jump', description: 'Jump over obstacles' }
]}
/>

```

```
