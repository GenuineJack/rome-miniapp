# PowerUpIndicator

**Type**: component

Power-up indicator component

Displays active power-ups with circular progress ring showing time remaining.
Stacks horizontally.

## JSX Usage

```jsx
import { PowerUpIndicator } from "@/neynar-farcaster-sdk/game";

<PowerUpIndicator powerUps={[]} position="top" className="" />;
```

## Component Props

### powerUps

- **Type**: `ActivePowerUp[]`
- **Required**: Yes
- **Description**: No description available

### position

- **Type**: `"top" | "bottom"`
- **Required**: No
- **Description**: No description available
- **Default**: "top"

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: ""

## Examples

const powerUps = usePowerUps(definitions);
<PowerUpIndicator powerUps={powerUps.activePowerUps} position="top" />

```

```
