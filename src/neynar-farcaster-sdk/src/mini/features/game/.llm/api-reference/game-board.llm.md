# GameBoard

**Type**: component

GameBoard - Container for game content and controls

Creates a two-section layout within a tab:

- Game area (fills available space)
- Controls section (fixed at bottom)

Usage:

```tsx
<GameBoard controls={<YourControls />}>
  <YourGameCanvas />
</GameBoard>
```

## JSX Usage

```jsx
import { GameBoard } from "@/neynar-farcaster-sdk/game";

<GameBoard controls={value}>{/* Your content here */}</GameBoard>;
```

## Component Props

### children

- **Type**: `ReactNode`
- **Required**: Yes
- **Description**: No description available

### controls

- **Type**: `ReactNode`
- **Required**: Yes
- **Description**: No description available
