# Game Power-Ups System Planning Guide

## Overview

The game power-ups system provides three complementary subsystems for temporary effects in games:

- **Power-ups**: Temporary active abilities with duration timers (shields, speed boosts)
- **Inventory**: Collectible items storage with deduplication (keys, coins)
- **Buffs**: Stackable stat modifiers with automatic expiration (damage+, defense+)

All three systems use global Jotai atoms for state management, ensuring consistency across components.

---

## Core Concepts

### 1. Power-Up Definition Structure

Power-ups are defined with a simple schema and extended with runtime state when activated:

```typescript
type PowerUpDefinition = {
  id: string; // Unique identifier
  name: string; // Display name
  duration: number; // Duration in milliseconds
  icon?: string; // Optional icon/emoji
};

type ActivePowerUp = PowerUpDefinition & {
  activatedAt: number; // Timestamp when activated
  expiresAt: number; // Timestamp when expires
  timeRemaining: number; // Computed remaining time
};
```

Key characteristics:

- Duration-based auto-expiration using game loop
- Only one instance of each power-up ID can be active
- Activating the same power-up again resets its timer
- Time remaining updated every 10ms via game loop

### 2. Duration-Based Auto-Expiration

All timed effects use a consistent expiration pattern:

```typescript
useGameLoop(() => {
  if (activeItems.length === 0) return;

  const now = Date.now();
  setActiveItems((prev) => {
    return prev
      .map((item) => ({
        ...item,
        timeRemaining: Math.max(0, item.expiresAt - now),
      }))
      .filter((item) => item.timeRemaining > 0);
  });
}, 10); // Update every 10ms
```

This pattern:

- Updates time remaining for all active items
- Automatically removes expired items
- Runs at 10ms interval for smooth visual updates
- Prevents negative time values with Math.max()

### 3. Inventory Deduplication by ID

The inventory system prevents duplicate items:

```typescript
function addItem(item: { id: string }) {
  setItems((prev) => {
    if (prev.some((i) => i.id === item.id)) {
      return prev; // Item already exists
    }
    return [...prev, item];
  });
}
```

Benefits:

- Prevents collecting the same key multiple times
- Simplifies "has item" checks
- Keeps inventory clean and predictable
- Can be extended with quantity tracking if needed

### 4. Buff Stacking Mechanics

Buffs stack multiplicatively for the same stat:

```typescript
function getModifier(stat: string) {
  const relevantBuffs = activeBuffs.filter((b) => b.stat === stat);
  if (relevantBuffs.length === 0) return 1.0;

  return relevantBuffs.reduce((total, buff) => total * buff.modifier, 1.0);
}
```

Examples:

- Two 2x damage buffs = 4x total damage (2 \* 2)
- 2x damage + 1.5x damage = 3x total damage (2 \* 1.5)
- 0.5x speed debuff + 2x speed buff = 1x speed (0.5 \* 2)

### 5. Visual Indicators

All three systems include visual components with circular progress rings:

- **Progress calculation**: `progress = timeRemaining / duration`
- **SVG stroke offset**: Creates animated countdown ring
- **Color coding**: Green for positive buffs, red for debuffs, blue for power-ups
- **Smooth transitions**: CSS transitions for fluid animations

---

## API Reference

### usePowerUps()

Active power-ups management hook with automatic expiration.

**Import:**

```typescript
import { usePowerUps } from "@/features/game/hooks/powerups/use-power-ups";
```

**Signature:**

```typescript
function usePowerUps(definitions: PowerUpDefinition[]): {
  activePowerUps: ActivePowerUp[];
  activate: (id: string) => void;
  deactivate: (id: string) => void;
  isActive: (id: string) => boolean;
  getTimeRemaining: (id: string) => number;
};
```

**Parameters:**

- `definitions`: Array of power-up definitions to make available

**Returns:**

- `activePowerUps`: Array of currently active power-ups with timing data
- `activate(id)`: Activate a power-up by ID (resets timer if already active)
- `deactivate(id)`: Manually deactivate a power-up
- `isActive(id)`: Check if specific power-up is currently active
- `getTimeRemaining(id)`: Get remaining milliseconds for active power-up

**State Management:**

- Uses global Jotai atoms
- State shared across all components using this hook
- Automatic cleanup when power-ups expire

**Example:**

```typescript
const powerUpDefs = [
  { id: 'shield', name: 'Shield', duration: 10000, icon: '🛡️' },
  { id: 'speed', name: 'Speed Boost', duration: 5000, icon: '⚡' }
];

const powerUps = usePowerUps(powerUpDefs);

// Activate shield
powerUps.activate('shield');

// Check status
if (powerUps.isActive('shield')) {
  // Player is invincible
}

// Display all active
<PowerUpIndicator powerUps={powerUps.activePowerUps} />
```

---

### useInventory()

Simple inventory storage with deduplication.

**Import:**

```typescript
import { useInventory } from "@/features/game/hooks/powerups/use-inventory";
```

**Signature:**

```typescript
function useInventory(): {
  items: { id: string }[];
  addItem: (item: { id: string }) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  getItem: (id: string) => { id: string } | undefined;
  count: number;
  clear: () => void;
};
```

**Returns:**

- `items`: Array of collected items
- `addItem(item)`: Add item to inventory (ignored if already exists)
- `removeItem(id)`: Remove item by ID
- `hasItem(id)`: Check if item exists in inventory
- `getItem(id)`: Get item object by ID
- `count`: Total number of items
- `clear()`: Remove all items

**State Management:**

- Uses global Jotai atom
- State shared across all components using this hook
- Automatic deduplication by ID

**Example:**

```typescript
const inventory = useInventory();

// Collect items
inventory.addItem({ id: "key-red" });
inventory.addItem({ id: "coin-1" });
inventory.addItem({ id: "key-red" }); // Ignored, already exists

// Check for item
if (inventory.hasItem("key-red")) {
  // Can open red door
  openDoor();
  inventory.removeItem("key-red");
}

// Display count
console.log(`Items: ${inventory.count}`);
```

---

### useBuffs()

Temporary stat modifiers with stacking support.

**Import:**

```typescript
import { useBuffs } from "@/features/game/hooks/powerups/use-buffs";
```

**Signature:**

```typescript
type Buff = {
  id: string;
  type: "positive" | "negative";
  stat: string;
  modifier: number;
  duration: number;
  icon?: string;
};

function useBuffs(): {
  activeBuffs: Buff[];
  applyBuff: (buff: Buff) => void;
  removeBuff: (id: string) => void;
  getModifier: (stat: string) => number;
};
```

**Parameters:**

- `buff.id`: Unique identifier (only one instance per ID)
- `buff.type`: 'positive' or 'negative' for visual styling
- `buff.stat`: Name of stat being modified (e.g., 'damage', 'speed')
- `buff.modifier`: Multiplier value (2.0 = double, 0.5 = half)
- `buff.duration`: Duration in milliseconds
- `buff.icon`: Optional icon/emoji

**Returns:**

- `activeBuffs`: Array of currently active buffs
- `applyBuff(buff)`: Apply a new buff (resets if already active)
- `removeBuff(id)`: Manually remove a buff
- `getModifier(stat)`: Get combined multiplier for a stat

**Stacking:**

- Multiple buffs for same stat multiply together
- Returns 1.0 if no buffs active for that stat
- Example: 2x + 1.5x = 3x total

**Example:**

```typescript
const buffs = useBuffs();

// Apply damage buff
buffs.applyBuff({
  id: "rage",
  type: "positive",
  stat: "damage",
  modifier: 2.0,
  duration: 5000,
  icon: "💪",
});

// Apply another damage buff (stacks)
buffs.applyBuff({
  id: "berserk",
  type: "positive",
  stat: "damage",
  modifier: 1.5,
  duration: 3000,
});

// Calculate final damage
const damageMultiplier = buffs.getModifier("damage"); // 3.0
const finalDamage = baseDamage * damageMultiplier;
```

---

### PowerUpIndicator Component

Visual display for active power-ups with progress rings.

**Import:**

```typescript
import { PowerUpIndicator } from "@/features/game/components/powerups/power-up-indicator";
```

**Props:**

```typescript
type PowerUpIndicatorProps = {
  powerUps: ActivePowerUp[];
  position?: "top" | "bottom";
  className?: string;
};
```

**Features:**

- Circular progress ring showing time remaining
- Displays icon or first 2 letters of name
- Shows seconds remaining below icon
- Stacks horizontally
- Fixed positioning (top-left or bottom-left)

**Visual Details:**

- Progress ring: 48x48px with 4px stroke
- Ring color: Blue (#3B82F6)
- Background: White with shadow
- Updates smoothly via CSS transitions

**Example:**

```typescript
const powerUps = usePowerUps(definitions);

<PowerUpIndicator
  powerUps={powerUps.activePowerUps}
  position="top"
  className="z-50"
/>
```

---

### InventoryGrid Component

Grid layout for displaying inventory items.

**Import:**

```typescript
import { InventoryGrid } from "@/features/game/components/powerups/inventory-grid";
```

**Props:**

```typescript
type InventoryGridProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  columns?: number;
  onItemClick?: (item: T) => void;
  className?: string;
};
```

**Features:**

- Responsive grid layout
- Custom item rendering via render prop
- Optional click handling
- Hover effects when clickable
- Flexible styling

**Example:**

```typescript
const inventory = useInventory();

<InventoryGrid
  items={inventory.items}
  columns={4}
  renderItem={(item) => (
    <div className="text-2xl text-center">
      {itemIcons[item.id] || '?'}
    </div>
  )}
  onItemClick={(item) => {
    console.log('Clicked:', item.id);
  }}
  className="max-w-md mx-auto"
/>
```

---

### BuffIcon Component

Visual display for buffs/debuffs with progress rings.

**Import:**

```typescript
import { BuffIcon } from "@/features/game/components/powerups/buff-icon";
```

**Props:**

```typescript
type BuffIconProps = {
  buffs: Buff[];
  maxDisplay?: number;
  className?: string;
};
```

**Features:**

- Color-coded: Green for positive, red for negative
- Circular progress ring showing time remaining
- Displays icon or first letter of stat name
- Shows overflow count (+N) when exceeding maxDisplay
- Tooltip with stat modifier on hover

**Visual Details:**

- Icon size: 36x36px with 3px stroke
- Positive color: Green (#22C55E)
- Negative color: Red (#EF4444)
- Horizontal layout with 4px gap

**Example:**

```typescript
const buffs = useBuffs();

<BuffIcon
  buffs={buffs.activeBuffs}
  maxDisplay={5}
  className="absolute top-4 right-4"
/>
```

---

## Implementation Patterns

### Pattern 1: Temporary Shield/Invincibility

A classic invincibility power-up with visual feedback.

**Setup:**

```typescript
const powerUpDefs = [
  {
    id: "shield",
    name: "Shield",
    duration: 10000,
    icon: "🛡️",
  },
];

const powerUps = usePowerUps(powerUpDefs);
```

**Activation:**

```typescript
function collectPowerUp() {
  powerUps.activate("shield");
  playSound("powerup");
}
```

**Collision Detection:**

```typescript
function checkEnemyCollision(player, enemy) {
  if (collides(player, enemy)) {
    if (powerUps.isActive("shield")) {
      // Reflect damage back
      enemy.takeDamage(10);
      playEffect("shield-reflect");
    } else {
      // Normal damage
      player.takeDamage(enemy.damage);
    }
  }
}
```

**Visual Rendering:**

```tsx
function PlayerSprite({ player }) {
  const powerUps = usePowerUps([]);
  const hasShield = powerUps.isActive("shield");

  return (
    <div className="relative">
      <img src={player.sprite} alt="player" />
      {hasShield && (
        <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse" />
      )}
    </div>
  );
}
```

**UI Display:**

```tsx
<PowerUpIndicator powerUps={powerUps.activePowerUps} position="top" />
```

---

### Pattern 2: Speed Boost Power-Up

Temporary movement speed increase with multiple applications.

**Setup:**

```typescript
const powerUpDefs = [
  {
    id: "speed",
    name: "Speed Boost",
    duration: 5000,
    icon: "⚡",
  },
];

const powerUps = usePowerUps(powerUpDefs);
```

**Movement System:**

```typescript
function updatePlayerMovement(input) {
  let baseSpeed = 5;

  // Apply speed boost if active
  if (powerUps.isActive("speed")) {
    baseSpeed *= 2; // Double speed
  }

  if (input.left) player.x -= baseSpeed;
  if (input.right) player.x += baseSpeed;
  if (input.up) player.y -= baseSpeed;
  if (input.down) player.y += baseSpeed;
}
```

**Pickup System:**

```typescript
function checkPowerUpPickup() {
  const speedBoosts = findNearbyPowerUps("speed");

  for (const boost of speedBoosts) {
    if (collides(player, boost)) {
      powerUps.activate("speed");
      removeFromWorld(boost);

      // Show notification
      showMessage("Speed Boost Activated!");
    }
  }
}
```

**Visual Trail Effect:**

```tsx
function Player() {
  const powerUps = usePowerUps([]);
  const hasSpeed = powerUps.isActive("speed");

  return (
    <div className="relative">
      {hasSpeed && (
        <div className="absolute inset-0 bg-yellow-400 opacity-50 blur-md -z-10" />
      )}
      <PlayerSprite />
    </div>
  );
}
```

---

### Pattern 3: Collectible Items (Coins, Keys)

Persistent inventory for quest items and collectibles.

**Setup:**

```typescript
const inventory = useInventory();

type Item = {
  id: string;
  name: string;
  icon: string;
};

const itemDatabase: Record<string, Item> = {
  "key-red": { id: "key-red", name: "Red Key", icon: "🔑" },
  "key-blue": { id: "key-blue", name: "Blue Key", icon: "🔑" },
  coin: { id: "coin", name: "Coin", icon: "🪙" },
};
```

**Collection System:**

```typescript
function checkItemPickup() {
  const nearbyItems = findNearbyItems(player.position, 50);

  for (const item of nearbyItems) {
    if (collides(player, item)) {
      inventory.addItem({ id: item.id });
      removeFromWorld(item);
      playSound("collect");

      showMessage(`Collected ${itemDatabase[item.id].name}!`);
    }
  }
}
```

**Door/Lock System:**

```typescript
function tryOpenDoor(door) {
  const requiredKey = door.keyRequired; // e.g., 'key-red'

  if (inventory.hasItem(requiredKey)) {
    // Consume key
    inventory.removeItem(requiredKey);

    // Open door
    door.unlock();
    playSound("door-open");

    showMessage(`Used ${itemDatabase[requiredKey].name}`);
  } else {
    showMessage(`Requires ${itemDatabase[requiredKey].name}`);
    playSound("door-locked");
  }
}
```

**Inventory UI:**

```tsx
function InventoryPanel() {
  const inventory = useInventory();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white mb-2">Inventory ({inventory.count}/20)</h3>

      <InventoryGrid
        items={inventory.items}
        columns={5}
        renderItem={(item) => (
          <div className="text-3xl text-center">
            {itemDatabase[item.id]?.icon || "?"}
          </div>
        )}
        onItemClick={(item) => {
          console.log("Selected:", itemDatabase[item.id].name);
        }}
      />
    </div>
  );
}
```

---

### Pattern 4: Stat Modifier Buffs (Damage+, Defense+)

Temporary stat increases with stacking support.

**Setup:**

```typescript
const buffs = useBuffs();

const buffDefinitions = {
  rage: {
    id: "rage",
    type: "positive" as const,
    stat: "damage",
    modifier: 2.0,
    duration: 8000,
    icon: "💪",
  },
  weakness: {
    id: "weakness",
    type: "negative" as const,
    stat: "damage",
    modifier: 0.5,
    duration: 5000,
    icon: "💔",
  },
  defense: {
    id: "defense",
    type: "positive" as const,
    stat: "defense",
    modifier: 1.5,
    duration: 10000,
    icon: "🛡️",
  },
};
```

**Combat System:**

```typescript
function attackEnemy(enemy) {
  const baseDamage = 10;

  // Apply damage buffs
  const damageModifier = buffs.getModifier("damage");
  const finalDamage = baseDamage * damageModifier;

  enemy.health -= finalDamage;

  showDamageText(enemy.position, finalDamage);
}

function takeDamage(amount) {
  // Apply defense buffs
  const defenseModifier = buffs.getModifier("defense");
  const reducedDamage = amount / defenseModifier;

  player.health -= reducedDamage;

  flashScreen("red");
}
```

**Buff Pickup:**

```typescript
function collectBuff(buffId: keyof typeof buffDefinitions) {
  const buff = buffDefinitions[buffId];
  buffs.applyBuff(buff);

  playSound("buff-apply");
  showMessage(`${buff.icon} ${buff.stat.toUpperCase()} x${buff.modifier}`);
}
```

**UI Display:**

```tsx
function HUD() {
  const buffs = useBuffs();

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2">
      <BuffIcon buffs={buffs.activeBuffs} maxDisplay={6} />

      {/* Show damage modifier */}
      <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded">
        DMG: {buffs.getModifier("damage").toFixed(1)}x
      </div>
    </div>
  );
}
```

---

### Pattern 5: Visual Indicators with Countdown Timers

Complete UI system showing all active effects.

**Component:**

```tsx
function GameOverlay() {
  const powerUps = usePowerUps(powerUpDefinitions);
  const buffs = useBuffs();

  return (
    <>
      {/* Active power-ups */}
      <PowerUpIndicator
        powerUps={powerUps.activePowerUps}
        position="top"
        className="z-50"
      />

      {/* Active buffs */}
      <div className="fixed top-4 right-4 z-50">
        <BuffIcon buffs={buffs.activeBuffs} maxDisplay={8} />
      </div>

      {/* Detailed info on hover/click */}
      <div className="fixed bottom-4 left-4 right-4 bg-black bg-opacity-75 p-4 rounded-lg text-white">
        <h4 className="font-bold mb-2">Active Effects</h4>

        {powerUps.activePowerUps.map((pu) => (
          <div key={pu.id} className="flex justify-between">
            <span>
              {pu.icon} {pu.name}
            </span>
            <span>{Math.ceil(pu.timeRemaining / 1000)}s</span>
          </div>
        ))}

        {buffs.activeBuffs.map((buff) => (
          <div key={buff.id} className="flex justify-between">
            <span>
              {buff.icon} {buff.stat} x{buff.modifier}
            </span>
            <span>{Math.ceil((buff.timeRemaining || 0) / 1000)}s</span>
          </div>
        ))}
      </div>
    </>
  );
}
```

**Notification System:**

```typescript
type Notification = {
  id: string;
  message: string;
  icon: string;
  type: "powerup" | "buff" | "item";
  timestamp: number;
};

const [notifications, setNotifications] = useState<Notification[]>([]);

function showNotification(
  message: string,
  icon: string,
  type: Notification["type"],
) {
  const notif: Notification = {
    id: Date.now().toString(),
    message,
    icon,
    type,
    timestamp: Date.now(),
  };

  setNotifications((prev) => [...prev, notif]);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  }, 3000);
}

// Usage
powerUps.activate("shield");
showNotification("Shield Activated!", "🛡️", "powerup");
```

**Animation Effects:**

```tsx
function NotificationList() {
  return (
    <div className="fixed top-20 left-4 flex flex-col gap-2 z-50">
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in"
          style={{
            animation: "slideIn 0.3s ease-out",
            opacity: 1 - index * 0.2,
          }}
        >
          <span className="text-xl mr-2">{notif.icon}</span>
          {notif.message}
        </div>
      ))}
    </div>
  );
}
```

---

### Pattern 6: Multiple Active Power-Ups Management

Managing several simultaneous power-ups with priority system.

**Advanced Setup:**

```typescript
const powerUpDefs = [
  { id: "shield", name: "Shield", duration: 10000, icon: "🛡️" },
  { id: "speed", name: "Speed", duration: 5000, icon: "⚡" },
  { id: "double-jump", name: "Double Jump", duration: 8000, icon: "👟" },
  { id: "magnet", name: "Magnet", duration: 6000, icon: "🧲" },
];

const powerUps = usePowerUps(powerUpDefs);
```

**Combined Effects:**

```typescript
function updateGameState() {
  // Speed affects movement
  let speed = BASE_SPEED;
  if (powerUps.isActive("speed")) {
    speed *= 2;
  }

  // Shield affects collision
  if (powerUps.isActive("shield")) {
    player.invulnerable = true;
  } else {
    player.invulnerable = false;
  }

  // Double jump affects controls
  if (powerUps.isActive("double-jump")) {
    player.maxJumps = 2;
  } else {
    player.maxJumps = 1;
  }

  // Magnet affects item collection
  if (powerUps.isActive("magnet")) {
    collectItemsInRadius(player.position, 200);
  }
}
```

**Priority System:**

```typescript
function checkPowerUpPickup(pickup: PowerUpPickup) {
  // Only allow N simultaneous power-ups
  const MAX_ACTIVE = 3;

  if (powerUps.activePowerUps.length >= MAX_ACTIVE) {
    // Remove oldest power-up
    const oldest = powerUps.activePowerUps[0];
    powerUps.deactivate(oldest.id);

    showMessage(`${oldest.name} replaced by ${pickup.name}`);
  }

  powerUps.activate(pickup.id);
}
```

**Combo System:**

```typescript
function checkCombos() {
  // Speed + Double Jump = Triple Jump
  if (powerUps.isActive("speed") && powerUps.isActive("double-jump")) {
    player.maxJumps = 3;
    showMessage("🌟 COMBO: Triple Jump!");
  }

  // Shield + Magnet = Magnetic Shield
  if (powerUps.isActive("shield") && powerUps.isActive("magnet")) {
    player.reflectProjectiles = true;
    showMessage("🌟 COMBO: Magnetic Shield!");
  }
}
```

---

## Best Practices

### Expiration Handling

1. **Always use game loop for timing**: Ensures accurate updates even when tab is backgrounded
2. **Filter expired items in update loop**: Don't wait for external cleanup
3. **Use timestamps, not counters**: More reliable across frame rate variations

### Visual Feedback

1. **Show remaining time**: Users should always know when effects expire
2. **Color code by type**: Positive (green), negative (red), neutral (blue)
3. **Smooth animations**: Use CSS transitions for progress rings
4. **Sound effects**: Audio cues for activation/expiration

### Performance

1. **Limit update frequency**: 10ms is sufficient for smooth visuals
2. **Early return when empty**: Skip updates when no active effects
3. **Batch state updates**: Use functional updates for consistency
4. **Avoid re-renders**: Visual components should be memoized if expensive

### State Management

1. **Use global atoms**: Ensures consistency across components
2. **Single source of truth**: Don't duplicate state
3. **Immutable updates**: Always create new arrays/objects
4. **Cleanup on unmount**: Not needed with global atoms

---

## Common Gotchas

1. **Activating same power-up twice**: Resets timer, doesn't extend it
2. **Buff stacking**: Multiplicative, not additive (2x + 2x = 4x, not 3x)
3. **Inventory deduplication**: Can't collect multiples of same ID
4. **Time precision**: Use Date.now() consistently, not performance.now()
5. **Visual updates**: 10ms update interval required for smooth animations
