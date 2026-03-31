# Game UI Controls and Layouts - Implementation Planning Guide

**Target Audience**: LLM agents implementing game interfaces
**Scope**: Complete UI control patterns, layouts, and responsive design for game mini-apps
**Dependencies**: `@neynar/ui`, React 18+, Tailwind CSS

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Layout Patterns](#layout-patterns)
4. [Control Patterns](#control-patterns)
5. [Integration Patterns](#integration-patterns)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)
8. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### Component Hierarchy

```
GameMiniLayout (Root Layout)
├── MiniappHeader (Static header)
├── Tabs (Navigation)
│   ├── TabsList (Tab buttons)
│   └── TabsContent (Active content)
└── GameBoard (Game container)
    ├── Game Content Area (flex-1)
    └── Controls Section (fixed bottom)
        ├── DirectionalPad
        └── ActionButtons
```

### Layout Philosophy

**Full-height Design**: No scrolling in game area - uses viewport height (`h-dvh`)

**Three-section Structure**:

1. Header - Static, part of flow (not floating)
2. Tabs - Navigation between views (Play, Stats, Settings)
3. Content - Main game/content area with controls

**Control Positioning**: Fixed at bottom of game area, always visible

### State Management Integration

Controls connect to game state through:

- `useInitializeGame` - Register actions and handlers
- `useGameActionHandlers` - Get touch handlers for buttons
- `useActiveGameActions` - Visual feedback for active keys
- `useGameControlsEnabled` - Enable/disable controls

---

## Core Components

### 1. GameMiniLayout

**Purpose**: Root layout container with header and tab navigation

**Key Features**:

- Static header (not floating)
- Full viewport height (`h-dvh`)
- Tab-based navigation
- No scrolling in layout (scrolling per tab)

**Props**:

```typescript
type GameMiniLayoutProps = {
  tabs: GameTab[]; // Array of tab configurations
  defaultTab?: string; // Initial tab (defaults to first)
};

type GameTab = {
  label: string; // Tab button text
  content: ReactNode; // Tab content
};
```

**Implementation Details**:

- Tab values auto-generated from labels (lowercase)
- Uses `@neynar/ui` Tabs component
- Header shows `publicConfig.shortName`
- Content area uses `overflow-scroll` per tab

**Usage**:

```tsx
<GameMiniLayout
  tabs={[
    { label: "Play", content: <PlayTab /> },
    { label: "Stats", content: <StatsTab /> },
    { label: "Settings", content: <SettingsTab /> },
  ]}
  defaultTab="play"
/>
```

### 2. GameBoard

**Purpose**: Container for game content and controls within a tab

**Key Features**:

- Two-section vertical layout
- Game area fills available space
- Controls fixed at bottom

**Props**:

```typescript
type GameBoardProps = {
  children: ReactNode; // Game canvas/content
  controls: ReactNode; // Control components
};
```

**Implementation Details**:

- Uses flex column layout
- Game area: `flex-1 overflow-y-auto`
- Controls: Fixed section with `bg-card border-t p-1`
- Rendered within TabsContent

**Usage**:

```tsx
<GameBoard controls={<YourControls />}>
  <canvas ref={canvasRef} className="w-full h-full" />
</GameBoard>
```

### 3. DirectionalPad

**Purpose**: Pre-built directional control component (D-pad)

**Key Features**:

- Three layout modes: horizontal, vertical, full
- Dual input: touch and mouse
- Keyboard hints on hover
- Customizable button size

**Props**:

```typescript
type DirectionalPadProps = {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  layout?: "horizontal" | "vertical" | "full";
  buttonSize?: string; // Default: "w-12 h-12"
  className?: string;
  keyboardHints?: {
    left?: string[];
    right?: string[];
    up?: string[];
    down?: string[];
  };
};
```

**Layout Modes**:

**Horizontal** (`layout="horizontal"`):

- Left and right arrows only
- Best for: side-scrollers, racing games
- Renders as: `[←] [→]`

**Vertical** (`layout="vertical"`):

- Up and down arrows only
- Best for: elevator games, vertical scrollers
- Renders as vertical stack

**Full** (`layout="full"`):

- All four directions
- Best for: top-down games, menus
- Renders as: `[←] [↓] [↑] [→]` (single row)

**Implementation Details**:

- Uses `DirectionButton` wrapper internally
- Handles `onTouchStart` and `onMouseDown`
- Shows keyboard hints with `<Kbd>` component
- Arrow symbols: `←`, `→`, `↑`, `↓`
- Active state: `active:scale-95` transition

**Keyboard Hint Display**:

- Appears on hover/focus above button
- Shows up to 2 keys per button
- Prefers short keys (WASD) over arrow keys
- Formats arrow keys as symbols (↑ ↓ ← →)

### 4. ActionButtons

**Purpose**: Pre-built action button group (1-2 buttons)

**Key Features**:

- Supports 1-2 action buttons
- Custom labels (text, icons, React nodes)
- Visual feedback for active state
- Configurable variants and layout

**Props**:

```typescript
type ActionButtonsProps = {
  onAction?: () => void;
  onAction2?: () => void;
  actionLabel?: React.ReactNode; // Default: "↑"
  action2Label?: React.ReactNode; // Default: "A"
  actionVariant?: "default" | "secondary" | "outline" | "ghost";
  action2Variant?: "default" | "secondary" | "outline" | "ghost";
  buttonSize?: string; // Default: "w-12 h-12"
  layout?: "horizontal" | "vertical"; // Default: "horizontal"
  className?: string;
  keyboardHints?: {
    action?: string[];
    action2?: string[];
  };
  activeKeys?: Set<GameAction>; // For visual feedback
};
```

**Implementation Details**:

- Uses `ActionButtonWrapper` internally
- Handles `onTouchStart` and `onMouseDown`
- Shows keyboard hints with `<Kbd>` component
- Active state visual: `scale-95 ring-2 ring-primary/50 shadow-inner`
- Uses `aria-pressed` for accessibility

**Label Support**:

- Text: `"Jump"`, `"Fire"`, `"A"`, `"B"`
- Symbols: `"↑"`, `"○"`, `"×"`
- Icons: `<RotateCw className="w-4 h-4" />`
- Any React node

---

## Layout Patterns

### Pattern 1: Standard Platform Game (Recommended)

**Use Case**: Side-scrolling platformer (Mario-style)

**Layout**: Horizontal D-pad + Single action button

**Code**:

```tsx
import {
  GameMiniLayout,
  GameBoard,
  DirectionalPad,
  ActionButtons,
  useInitializeGame,
  useGameActionHandlers,
  useActiveGameActions,
} from "@/neynar-farcaster-sdk/mini";

function PlatformerGame() {
  // Register actions and keyboard handlers
  useInitializeGame({
    actions: {
      left: {
        handler: () => movePlayer("left"),
        allowRepeat: true,
      },
      right: {
        handler: () => movePlayer("right"),
        allowRepeat: true,
      },
      jump: {
        handler: () => playerJump(),
        allowRepeat: false, // Must release to jump again
      },
    },
  });

  // Get handlers for touch controls
  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-4">
                  <DirectionalPad
                    layout="horizontal"
                    onLeft={handlers.left}
                    onRight={handlers.right}
                    keyboardHints={{
                      left: ["a", "A", "ArrowLeft"],
                      right: ["d", "D", "ArrowRight"],
                    }}
                  />
                  <ActionButtons
                    onAction={handlers.jump}
                    actionLabel="↑"
                    keyboardHints={{
                      action: [" ", "w", "W", "ArrowUp"],
                    }}
                    activeKeys={activeKeys}
                  />
                </div>
              }
            >
              <canvas ref={canvasRef} className="w-full h-full" />
            </GameBoard>
          ),
        },
        {
          label: "Stats",
          content: <StatsView />,
        },
      ]}
      defaultTab="play"
    />
  );
}
```

**Why This Works**:

- Left/right movement with auto-repeat for smooth motion
- Jump button requires key release (prevents spam)
- Controls spread across bottom (thumb-friendly)
- Visual feedback when keys are pressed

### Pattern 2: Top-Down Game (Full D-Pad)

**Use Case**: Top-down adventure, maze game, twin-stick shooter

**Layout**: Full 4-way D-pad + Action buttons

**Code**:

```tsx
function TopDownGame() {
  useInitializeGame({
    actions: {
      left: { handler: () => move("left"), allowRepeat: true },
      right: { handler: () => move("right"), allowRepeat: true },
      up: { handler: () => move("up"), allowRepeat: true },
      down: { handler: () => move("down"), allowRepeat: true },
      action: { handler: () => interact() },
      action2: { handler: () => attack() },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-4">
                  <DirectionalPad
                    layout="full"
                    onLeft={handlers.left}
                    onRight={handlers.right}
                    onUp={handlers.up}
                    onDown={handlers.down}
                    keyboardHints={{
                      left: ["a", "ArrowLeft"],
                      right: ["d", "ArrowRight"],
                      up: ["w", "ArrowUp"],
                      down: ["s", "ArrowDown"],
                    }}
                  />
                  <ActionButtons
                    onAction={handlers.action}
                    onAction2={handlers.action2}
                    actionLabel="Interact"
                    action2Label="Attack"
                    keyboardHints={{
                      action: [" "],
                      action2: ["Shift"],
                    }}
                    activeKeys={activeKeys}
                  />
                </div>
              }
            >
              <GameCanvas />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Key Differences**:

- All 4 directions enabled
- Two action buttons for different actions
- Text labels for clarity

### Pattern 3: Puzzle Game with Icons

**Use Case**: Tetris-style, falling block games

**Layout**: Horizontal controls + Icon buttons

**Code**:

```tsx
import { RotateCw, ArrowDown } from "lucide-react";

function PuzzleGame() {
  useInitializeGame({
    actions: {
      left: { handler: () => moveBlock("left"), allowRepeat: true },
      right: { handler: () => moveBlock("right"), allowRepeat: true },
      action: { handler: () => rotateBlock() },
      action2: {
        handler: () => dropBlock(),
        allowRepeat: true,
      },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-4">
                  <DirectionalPad
                    layout="horizontal"
                    onLeft={handlers.left}
                    onRight={handlers.right}
                    buttonSize="w-14 h-14"
                  />
                  <ActionButtons
                    onAction={handlers.action}
                    onAction2={handlers.action2}
                    actionLabel={<RotateCw className="w-5 h-5" />}
                    action2Label={<ArrowDown className="w-5 h-5" />}
                    buttonSize="w-14 h-14"
                    actionVariant="secondary"
                    action2Variant="outline"
                    keyboardHints={{
                      action: [" ", "w", "ArrowUp"],
                      action2: ["s", "ArrowDown"],
                    }}
                    activeKeys={activeKeys}
                  />
                </div>
              }
            >
              <PuzzleGrid />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Icon Integration**:

- Import from `lucide-react`
- Size icons with className: `w-4 h-4`, `w-5 h-5`, etc.
- Icons auto-center in buttons

### Pattern 4: Horizontal Scrolling Only

**Use Case**: Racing games, endless runners

**Layout**: Horizontal D-pad only

**Code**:

```tsx
function RacingGame() {
  useInitializeGame({
    actions: {
      left: { handler: () => steerLeft(), allowRepeat: true },
      right: { handler: () => steerRight(), allowRepeat: true },
    },
  });

  const handlers = useGameActionHandlers();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex justify-center w-full">
                  <DirectionalPad
                    layout="horizontal"
                    onLeft={handlers.left}
                    onRight={handlers.right}
                    buttonSize="w-16 h-16"
                    keyboardHints={{
                      left: ["a", "ArrowLeft"],
                      right: ["d", "ArrowRight"],
                    }}
                  />
                </div>
              }
            >
              <RacingView />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Simplification**:

- Only movement controls needed
- Centered in control area
- Larger buttons for easier touch

### Pattern 5: Vertical Controls

**Use Case**: Elevator games, vertical scrollers

**Layout**: Vertical D-pad + Action button

**Code**:

```tsx
function ElevatorGame() {
  useInitializeGame({
    actions: {
      up: { handler: () => moveElevatorUp(), allowRepeat: true },
      down: { handler: () => moveElevatorDown(), allowRepeat: true },
      action: { handler: () => openDoor() },
    },
  });

  const handlers = useGameActionHandlers();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-around w-full px-4">
                  <DirectionalPad
                    layout="vertical"
                    onUp={handlers.up}
                    onDown={handlers.down}
                    keyboardHints={{
                      up: ["w", "ArrowUp"],
                      down: ["s", "ArrowDown"],
                    }}
                  />
                  <ActionButtons
                    onAction={handlers.action}
                    actionLabel="Open"
                    keyboardHints={{
                      action: [" "],
                    }}
                  />
                </div>
              }
            >
              <ElevatorShaft />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Vertical Layout**:

- Up/down arranged vertically
- Good for games with vertical movement only

### Pattern 6: One-Button Game

**Use Case**: Flappy Bird, tap games

**Layout**: Single action button (centered)

**Code**:

```tsx
function OneButtonGame() {
  useInitializeGame({
    actions: {
      action: { handler: () => flap() },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex justify-center w-full">
                  <ActionButtons
                    onAction={handlers.action}
                    actionLabel="Tap"
                    buttonSize="w-24 h-16"
                    actionVariant="default"
                    keyboardHints={{
                      action: [" ", "ArrowUp", "w"],
                    }}
                    activeKeys={activeKeys}
                  />
                </div>
              }
            >
              <GameCanvas />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Simplest Pattern**:

- Single large button
- Centered for easy access
- Multiple keyboard keys map to same action

### Pattern 7: Tab Navigation for Menus

**Use Case**: Games with multiple screens (inventory, map, settings)

**Layout**: Multiple tabs with different content

**Code**:

```tsx
function RPGGame() {
  useInitializeGame({
    actions: {
      left: { handler: () => move("left"), allowRepeat: true },
      right: { handler: () => move("right"), allowRepeat: true },
      up: { handler: () => move("up"), allowRepeat: true },
      down: { handler: () => move("down"), allowRepeat: true },
      action: { handler: () => interact() },
    },
  });

  const handlers = useGameActionHandlers();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-4">
                  <DirectionalPad
                    layout="full"
                    onLeft={handlers.left}
                    onRight={handlers.right}
                    onUp={handlers.up}
                    onDown={handlers.down}
                  />
                  <ActionButtons
                    onAction={handlers.action}
                    actionLabel="Talk"
                  />
                </div>
              }
            >
              <GameWorld />
            </GameBoard>
          ),
        },
        {
          label: "Inventory",
          content: <InventoryGrid />,
        },
        {
          label: "Map",
          content: <WorldMap />,
        },
        {
          label: "Settings",
          content: <GameSettings />,
        },
      ]}
      defaultTab="play"
    />
  );
}
```

**Multi-Tab Benefits**:

- Separate screens without modal overlays
- Clear navigation via tab bar
- Each tab can have independent scrolling
- Only Play tab needs controls

### Pattern 8: Gamepad-Style Layout (Two-Handed)

**Use Case**: Action games requiring both hands

**Layout**: D-pad (left) + Multiple action buttons (right)

**Code**:

```tsx
function ActionGame() {
  useInitializeGame({
    actions: {
      left: { handler: () => move("left"), allowRepeat: true },
      right: { handler: () => move("right"), allowRepeat: true },
      up: { handler: () => move("up"), allowRepeat: true },
      down: { handler: () => move("down"), allowRepeat: true },
      action: { handler: () => primaryAttack() },
      action2: { handler: () => secondaryAttack() },
      jump: { handler: () => jump() },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-2">
                  {/* Left side: D-pad */}
                  <div className="flex items-center">
                    <DirectionalPad
                      layout="full"
                      onLeft={handlers.left}
                      onRight={handlers.right}
                      onUp={handlers.up}
                      onDown={handlers.down}
                      buttonSize="w-12 h-12"
                    />
                  </div>

                  {/* Right side: Action buttons */}
                  <div className="flex gap-2">
                    <ActionButtons
                      onAction={handlers.action}
                      actionLabel="A"
                      buttonSize="w-12 h-12"
                      activeKeys={activeKeys}
                    />
                    <ActionButtons
                      onAction={handlers.action2}
                      actionLabel="B"
                      actionVariant="outline"
                      buttonSize="w-12 h-12"
                      activeKeys={activeKeys}
                    />
                    <ActionButtons
                      onAction={handlers.jump}
                      actionLabel="↑"
                      actionVariant="secondary"
                      buttonSize="w-12 h-12"
                      activeKeys={activeKeys}
                    />
                  </div>
                </div>
              }
            >
              <ActionGameView />
            </GameBoard>
          ),
        },
      ]}
    />
  );
}
```

**Advanced Layout**:

- Multiple individual ActionButtons components
- Full control over button arrangement
- Console controller feel

---

## Control Patterns

### Touch Target Guidelines

**Minimum Size**: 48x48px (iOS/Android recommendation)

**Default Sizes**:

- Standard: `w-12 h-12` (48px)
- Large: `w-14 h-14` (56px)
- Extra Large: `w-16 h-16` (64px)

**Spacing**: Minimum 8px between buttons (`gap-2`)

**Example**:

```tsx
<DirectionalPad buttonSize="w-14 h-14" />
<ActionButtons buttonSize="w-16 h-16" />
```

### Dual Input Handling

Components automatically handle both touch and mouse events:

```typescript
// Inside DirectionButton/ActionButtonWrapper
const handleInteraction = (e: React.TouchEvent | React.MouseEvent) => {
  e.preventDefault();  // Prevent default browser behavior
  onPress();           // Trigger action
};

<Button
  onTouchStart={handleInteraction}
  onMouseDown={handleInteraction}
  // ...
/>
```

**Why Both Events**:

- `onTouchStart` - Mobile touch (no delay)
- `onMouseDown` - Desktop mouse/click
- `preventDefault()` - Prevents ghost clicks on mobile

### Active State Feedback

**Visual Feedback Types**:

1. **Scale Animation** (all buttons):

```tsx
className = "active:scale-95 transition-transform";
```

2. **Active Key Highlight** (when keyboard pressed):

```tsx
className={`${isActive
  ? "scale-95 ring-2 ring-primary/50 shadow-inner"
  : "active:scale-95"
}`}
```

**Implementation**:

```tsx
// Get active keys from game state
const activeKeys = useActiveGameActions();

// Pass to ActionButtons
<ActionButtons
  onAction={handlers.action}
  activeKeys={activeKeys} // Shows visual feedback when Space pressed
/>;
```

**Why It Matters**:

- Users see when keyboard is recognized
- Debug input issues easily
- Matches physical button feedback

### Keyboard Hints

**Display Behavior**:

- Hidden by default
- Shown on hover/focus
- Positioned above button
- Fades in/out smoothly

**Implementation**:

```tsx
keyboardHints={{
  left: ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight'],
}}
```

**Formatting Rules**:

- Shows up to 2 keys per button
- Prefers short keys (single char) first
- Arrow keys formatted as symbols: ↑ ↓ ← →
- Space key formatted as "Space"

**CSS**:

```tsx
<div
  className="absolute -top-7 left-1/2 -translate-x-1/2
                opacity-0 group-hover:opacity-100
                group-focus-within:opacity-100
                transition-opacity pointer-events-none z-10"
>
  <Kbd className="text-xs">{key}</Kbd>
</div>
```

### Rate Limiting

Control action frequency with `rateLimitMs`:

```tsx
useInitializeGame({
  actions: {
    shoot: {
      handler: () => fireBullet(),
      rateLimitMs: 100, // Max 10 shots per second
    },
  },
});
```

**Use Cases**:

- Shooting games (prevent spam)
- Special abilities (cooldowns)
- Sound effects (prevent overlapping)

### Allow Repeat

Control whether holding key triggers multiple actions:

```tsx
useInitializeGame({
  actions: {
    left: {
      handler: () => move("left"),
      allowRepeat: true, // Smooth continuous movement
    },
    jump: {
      handler: () => jump(),
      allowRepeat: false, // Must release to jump again
    },
  },
});
```

**Default**: `true` (allows repeat)

**When to Disable**:

- Jump actions
- Shooting/attacking
- Menu selections
- Any action that should require key release

---

## Integration Patterns

### Full Integration Example

Complete game with all features:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  GameMiniLayout,
  GameBoard,
  DirectionalPad,
  ActionButtons,
  MuteButton,
  useInitializeGame,
  useGameActionHandlers,
  useActiveGameActions,
  useScore,
  useTimer,
  useGameLoop,
  useSfx,
} from "@/neynar-farcaster-sdk/mini";

export default function CompletePlatformer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState({
    playerX: 50,
    playerY: 0,
    velocityY: 0,
  });

  const { score, addScore } = useScore();
  const { time } = useTimer({ mode: "stopwatch" });
  const { play } = useSfx();

  // Initialize game with all controls
  useInitializeGame({
    allowNegativeScore: false,
    actions: {
      left: {
        handler: () => {
          play("blip");
          setGameState((prev) => ({
            ...prev,
            playerX: Math.max(0, prev.playerX - 5),
          }));
        },
        allowRepeat: true,
      },
      right: {
        handler: () => {
          play("blip");
          setGameState((prev) => ({
            ...prev,
            playerX: Math.min(100, prev.playerX + 5),
          }));
        },
        allowRepeat: true,
      },
      jump: {
        handler: () => {
          if (gameState.playerY === 0) {
            // Only jump if on ground
            play("jump");
            setGameState((prev) => ({
              ...prev,
              velocityY: 15,
            }));
          }
        },
        allowRepeat: false, // Must release to jump again
      },
      action: {
        handler: () => {
          play("coin");
          addScore(10);
        },
        rateLimitMs: 200, // Max 5 times per second
      },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  // Game loop for physics
  useGameLoop((deltaTime) => {
    setGameState((prev) => {
      let newY = prev.playerY + prev.velocityY * (deltaTime / 16.67);
      let newVelocityY = prev.velocityY - 0.5; // Gravity

      if (newY <= 0) {
        newY = 0;
        newVelocityY = 0;
      }

      return {
        ...prev,
        playerY: newY,
        velocityY: newVelocityY,
      };
    });
  });

  // Render game (simplified)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = "blue";
    ctx.fillRect(
      gameState.playerX * (canvas.width / 100),
      canvas.height - 50 - gameState.playerY,
      30,
      30,
    );
  }, [gameState]);

  return (
    <GameMiniLayout
      tabs={[
        {
          label: "Play",
          content: (
            <GameBoard
              controls={
                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex items-center gap-2">
                    <MuteButton />
                    <DirectionalPad
                      layout="horizontal"
                      onLeft={handlers.left}
                      onRight={handlers.right}
                      keyboardHints={{
                        left: ["a", "ArrowLeft"],
                        right: ["d", "ArrowRight"],
                      }}
                    />
                  </div>
                  <ActionButtons
                    onAction={handlers.jump}
                    onAction2={handlers.action}
                    actionLabel="Jump"
                    action2Label="Collect"
                    keyboardHints={{
                      action: [" ", "w", "ArrowUp"],
                      action2: ["e"],
                    }}
                    activeKeys={activeKeys}
                  />
                </div>
              }
            >
              <div className="h-full flex flex-col p-4">
                {/* HUD */}
                <div className="flex justify-between mb-4">
                  <div>Score: {score}</div>
                  <div>Time: {Math.floor(time / 1000)}s</div>
                </div>

                {/* Game canvas */}
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="flex-1 w-full border-2 border-border rounded"
                />
              </div>
            </GameBoard>
          ),
        },
        {
          label: "Stats",
          content: (
            <div className="p-4">
              <h2>Statistics</h2>
              <p>Final Score: {score}</p>
              <p>Time Played: {Math.floor(time / 1000)}s</p>
            </div>
          ),
        },
      ]}
      defaultTab="play"
    />
  );
}
```

### With Pause System

Disable controls during pause:

```tsx
import {
  useInitializeGame,
  usePause,
  useGameControlsEnabled,
  useSetGameControlsEnabled,
} from "@/neynar-farcaster-sdk/mini";

function GameWithPause() {
  const { isPaused, toggle } = usePause();
  const setControlsEnabled = useSetGameControlsEnabled();

  useInitializeGame({
    actions: {
      left: { handler: () => move("left"), allowRepeat: true },
      right: { handler: () => move("right"), allowRepeat: true },
      pause: { handler: () => toggle() }, // Escape key
    },
  });

  // Disable movement controls when paused
  useEffect(() => {
    setControlsEnabled(!isPaused);
  }, [isPaused, setControlsEnabled]);

  const handlers = useGameActionHandlers();

  return (
    <GameBoard
      controls={
        <>
          {isPaused && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-card p-6 rounded">
                <h2>Paused</h2>
                <p>Press Escape to resume</p>
              </div>
            </div>
          )}
          <DirectionalPad
            layout="horizontal"
            onLeft={handlers.left}
            onRight={handlers.right}
          />
        </>
      }
    >
      <GameCanvas />
    </GameBoard>
  );
}
```

### Custom Control Layout

Build completely custom arrangements:

```tsx
import { Button, Kbd } from "@neynar/ui";
import { Zap, Shield, Sword } from "lucide-react";

function CustomControls() {
  useInitializeGame({
    actions: {
      attack: { handler: () => attack() },
      defend: { handler: () => defend() },
      special: { handler: () => special(), rateLimitMs: 1000 },
    },
  });

  const handlers = useGameActionHandlers();
  const activeKeys = useActiveGameActions();

  return (
    <GameBoard
      controls={
        <div className="grid grid-cols-3 gap-2 p-2">
          <Button
            onTouchStart={(e) => {
              e.preventDefault();
              handlers.attack();
            }}
            variant="destructive"
            className="h-16 flex flex-col items-center gap-1"
          >
            <Sword className="w-5 h-5" />
            <span className="text-xs">Attack</span>
          </Button>

          <Button
            onTouchStart={(e) => {
              e.preventDefault();
              handlers.defend();
            }}
            variant="secondary"
            className="h-16 flex flex-col items-center gap-1"
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs">Defend</span>
          </Button>

          <Button
            onTouchStart={(e) => {
              e.preventDefault();
              handlers.special();
            }}
            variant="default"
            className="h-16 flex flex-col items-center gap-1"
            disabled={activeKeys.has("special")}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs">Special</span>
          </Button>
        </div>
      }
    >
      <BattleView />
    </GameBoard>
  );
}
```

---

## Responsive Design

### Portrait vs Landscape

Detect orientation and adjust layout:

```tsx
import { useEffect, useState } from "react";

function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  return isPortrait;
}

function ResponsiveGame() {
  const isPortrait = useOrientation();

  return (
    <GameBoard
      controls={
        isPortrait ? (
          // Portrait: Stack vertically
          <div className="flex flex-col items-center gap-2 p-2">
            <DirectionalPad layout="horizontal" />
            <ActionButtons onAction={handlers.jump} />
          </div>
        ) : (
          // Landscape: Side by side
          <div className="flex items-center justify-between px-4">
            <DirectionalPad layout="horizontal" />
            <ActionButtons onAction={handlers.jump} />
          </div>
        )
      }
    >
      <GameCanvas />
    </GameBoard>
  );
}
```

### Button Scaling

Adjust button sizes based on screen size:

```tsx
function ScalableControls() {
  const isSmallScreen = window.innerWidth < 375;
  const buttonSize = isSmallScreen ? "w-10 h-10" : "w-12 h-12";

  return (
    <DirectionalPad
      layout="horizontal"
      buttonSize={buttonSize}
      onLeft={handlers.left}
      onRight={handlers.right}
    />
  );
}
```

### Adaptive Layouts

Hide controls on larger screens:

```tsx
function AdaptiveGame() {
  const [showTouchControls, setShowTouchControls] = useState(false);

  useEffect(() => {
    // Show touch controls only on mobile
    const isMobile = "ontouchstart" in window;
    setShowTouchControls(isMobile);
  }, []);

  return (
    <GameBoard
      controls={
        showTouchControls ? (
          <DirectionalPad layout="horizontal" />
        ) : (
          <div className="text-center text-muted-foreground py-2">
            Use WASD or Arrow Keys
          </div>
        )
      }
    >
      <GameCanvas />
    </GameBoard>
  );
}
```

---

## Accessibility

### ARIA Labels

All pre-built components include proper ARIA:

```tsx
// DirectionButton
<Button aria-label="Move left">←</Button>
<Button aria-label="Move right">→</Button>

// ActionButtonWrapper
<Button
  aria-label="Primary action"
  aria-pressed={isActive}
>
  Jump
</Button>
```

### Keyboard Navigation

Tab through controls:

```tsx
<Button
  tabIndex={0}
  onFocus={() => showKeyboardHint()}
  onBlur={() => hideKeyboardHint()}
>
  Jump
</Button>
```

### Visual Feedback

Multiple feedback mechanisms:

- Scale animation on press
- Ring highlight when active
- Keyboard hints on hover
- Sound effects (optional)

### Screen Reader Support

```tsx
<div role="region" aria-label="Game controls">
  <DirectionalPad />
  <ActionButtons />
</div>

<canvas aria-label="Game canvas" role="img" />
```

---

## Performance Considerations

### Event Handler Optimization

Pre-built components use optimized handlers:

```tsx
// Single preventDefault call
const handleInteraction = (e: React.TouchEvent | React.MouseEvent) => {
  e.preventDefault(); // Prevent ghost clicks
  onPress();
};
```

### Touch Delay Elimination

Using `onTouchStart` instead of `onClick`:

- Removes 300ms click delay on mobile
- Immediate response to touch

### Re-render Optimization

Components use ref patterns to avoid unnecessary renders:

```tsx
const actionsRef = useRef<GameActionHandlers>({});

// Update ref instead of triggering re-render
useEffect(() => {
  actionsRef.current = actions;
}, [actions]);
```

### Memory Management

Event listeners cleaned up properly:

```tsx
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}, []);
```

---

## Common Pitfalls and Solutions

### Issue: Controls Not Working

**Symptoms**: Buttons render but don't trigger actions

**Cause**: Forgot to call `useInitializeGame`

**Solution**:

```tsx
// Wrong - no initialization
function Game() {
  const handlers = useGameActionHandlers(); // Returns empty handlers!
  return <DirectionalPad onLeft={handlers.left} />;
}

// Correct - initialize first
function Game() {
  useInitializeGame({
    actions: {
      left: { handler: () => move("left") },
    },
  });
  const handlers = useGameActionHandlers();
  return <DirectionalPad onLeft={handlers.left} />;
}
```

### Issue: Keyboard Hints Not Showing

**Symptoms**: No hints appear on hover

**Cause**: Missing `keyboardHints` prop or wrong format

**Solution**:

```tsx
// Wrong
<DirectionalPad
  onLeft={handlers.left}
  keyboardHints="a"  // Wrong type!
/>

// Correct
<DirectionalPad
  onLeft={handlers.left}
  keyboardHints={{
    left: ['a', 'A', 'ArrowLeft']
  }}
/>
```

### Issue: Actions Fire Too Fast

**Symptoms**: Rapid-fire actions, sound overlapping

**Solution**: Add rate limiting

```tsx
useInitializeGame({
  actions: {
    shoot: {
      handler: () => fire(),
      rateLimitMs: 100, // Max 10 shots/second
    },
  },
});
```

### Issue: Jump Spams When Held

**Symptoms**: Holding jump key causes multiple jumps

**Solution**: Disable repeat

```tsx
useInitializeGame({
  actions: {
    jump: {
      handler: () => jump(),
      allowRepeat: false, // Must release to jump again
    },
  },
});
```

### Issue: Controls Active During Pause

**Symptoms**: Player can move while game paused

**Solution**: Disable controls

```tsx
const { isPaused } = usePause();
const setControlsEnabled = useSetGameControlsEnabled();

useEffect(() => {
  setControlsEnabled(!isPaused);
}, [isPaused, setControlsEnabled]);
```

---

## Quick Reference

### Component Import Paths

```tsx
import {
  // Layouts
  GameMiniLayout,
  GameBoard,

  // Controls
  DirectionalPad,
  ActionButtons,

  // Hooks
  useInitializeGame,
  useGameActionHandlers,
  useActiveGameActions,
  useGameControlsEnabled,
  useSetGameControlsEnabled,
} from "@/neynar-farcaster-sdk/mini";
```

### Default Button Sizes

- Small: `w-10 h-10` (40px)
- Standard: `w-12 h-12` (48px) - default
- Large: `w-14 h-14` (56px)
- Extra Large: `w-16 h-16` (64px)

### Default Keyboard Bindings

| Action  | Keys                              |
| ------- | --------------------------------- |
| left    | `a`, `A`, `ArrowLeft`             |
| right   | `d`, `D`, `ArrowRight`            |
| up      | `w`, `W`, `ArrowUp`               |
| down    | `s`, `S`, `ArrowDown`             |
| jump    | `Space`, ` `, `w`, `W`, `ArrowUp` |
| action  | `Enter`, `e`, `E`                 |
| action2 | `Shift`, `q`, `Q`                 |
| pause   | `Escape`, `p`, `P`                |
| select  | `Enter`                           |

### Layout Modes Summary

| Layout       | Use Case                   | Buttons |
| ------------ | -------------------------- | ------- |
| `horizontal` | Side-scrollers, racing     | ← →     |
| `vertical`   | Elevators, vertical scroll | ↑ ↓     |
| `full`       | Top-down, 4-way movement   | ← ↓ ↑ → |

---

## Related Documentation

- `controls-implementation.md` - Original implementation guide
- `state-management.md` - Understanding game state atoms
- `quickstart-implementation.md` - Building your first game
- `../llms.txt` - Complete SDK feature catalog

---

**Last Updated**: 2025-01-28
**Version**: 1.0.0
**Target SDK**: @neynar/farcaster-sdk/mini
