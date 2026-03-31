# Game Utilities Planning Guide

A comprehensive guide to using math and random utilities for game development in Neynar miniapps.

## Overview

This guide covers essential utility functions for game mechanics, including mathematical operations, random number generation, and common game patterns. All utilities are pure functions with no side effects, making them predictable and testable.

## Math Utilities

### clamp(value, min, max)

Constrains a value between minimum and maximum bounds.

**Function Signature:**

```typescript
function clamp(value: number, min: number, max: number): number;
```

**Use Cases:**

- Restricting player movement to screen boundaries
- Limiting health/energy/resource values
- Constraining input values
- Preventing overflow/underflow

**Example 1: Player Movement Clamping**

```typescript
import { clamp } from "../utilities/math.ts";

type Player = {
  x: number;
  y: number;
  speed: number;
};

function updatePlayer(
  player: Player,
  dx: number,
  dy: number,
  screenWidth: number,
  screenHeight: number,
) {
  player.x = clamp(player.x + dx * player.speed, 0, screenWidth);
  player.y = clamp(player.y + dy * player.speed, 0, screenHeight);
}
```

**Example 2: Health System**

```typescript
type Character = {
  health: number;
  maxHealth: number;
};

function takeDamage(character: Character, damage: number) {
  character.health = clamp(character.health - damage, 0, character.maxHealth);
}

function heal(character: Character, amount: number) {
  character.health = clamp(character.health + amount, 0, character.maxHealth);
}
```

### lerp(start, end, t)

Linear interpolation between two values. Creates smooth transitions and animations.

**Function Signature:**

```typescript
function lerp(start: number, end: number, t: number): number;
```

**Parameters:**

- `start`: Initial value
- `end`: Target value
- `t`: Progress from 0 to 1 (0 = start, 0.5 = midpoint, 1 = end)

**Use Cases:**

- Smooth camera following
- Animated transitions
- Easing effects
- Score counters

**Example 1: Smooth Camera Following**

```typescript
import { lerp } from "../utilities/math.ts";

type Camera = {
  x: number;
  y: number;
};

type Target = {
  x: number;
  y: number;
};

function updateCamera(camera: Camera, target: Target, smoothness: number) {
  camera.x = lerp(camera.x, target.x, smoothness);
  camera.y = lerp(camera.y, target.y, smoothness);
}

const camera = { x: 0, y: 0 };
const player = { x: 100, y: 200 };

updateCamera(camera, player, 0.1);
```

**Example 2: Animated Score Counter**

```typescript
type ScoreDisplay = {
  current: number;
  target: number;
  speed: number;
};

function updateScoreDisplay(display: ScoreDisplay, deltaTime: number) {
  const t = Math.min(display.speed * deltaTime, 1);
  display.current = Math.round(lerp(display.current, display.target, t));

  return display.current === display.target;
}
```

### distance(x1, y1, x2, y2)

Calculates Euclidean distance between two points.

**Function Signature:**

```typescript
function distance(x1: number, y1: number, x2: number, y2: number): number;
```

**Use Cases:**

- Collision detection
- Proximity checks
- Range detection
- Click/touch accuracy

**Example 1: Collision Detection**

```typescript
import { distance } from "../utilities/math.ts";

type Entity = {
  x: number;
  y: number;
  radius: number;
};

function checkCollision(entity1: Entity, entity2: Entity): boolean {
  const dist = distance(entity1.x, entity1.y, entity2.x, entity2.y);
  return dist < entity1.radius + entity2.radius;
}

const player = { x: 100, y: 100, radius: 20 };
const enemy = { x: 150, y: 120, radius: 15 };

if (checkCollision(player, enemy)) {
  console.log("Collision detected!");
}
```

**Example 2: Range-Based AI**

```typescript
type Enemy = {
  x: number;
  y: number;
  attackRange: number;
  detectionRange: number;
  state: "idle" | "chase" | "attack";
};

function updateEnemyAI(enemy: Enemy, playerX: number, playerY: number) {
  const dist = distance(enemy.x, enemy.y, playerX, playerY);

  if (dist < enemy.attackRange) {
    enemy.state = "attack";
  } else if (dist < enemy.detectionRange) {
    enemy.state = "chase";
  } else {
    enemy.state = "idle";
  }
}
```

### degreesToRadians(degrees)

Converts angle from degrees to radians.

**Function Signature:**

```typescript
function degreesToRadians(degrees: number): number;
```

**Use Cases:**

- Sprite rotation
- Circular motion
- Trigonometric calculations
- Angular velocity

**Example 1: Circular Motion**

```typescript
import { degreesToRadians } from "../utilities/math.ts";

type CircularEntity = {
  centerX: number;
  centerY: number;
  radius: number;
  angle: number;
  x: number;
  y: number;
};

function updateCircularMotion(entity: CircularEntity, speed: number) {
  entity.angle += speed;
  const radians = degreesToRadians(entity.angle);

  entity.x = entity.centerX + Math.cos(radians) * entity.radius;
  entity.y = entity.centerY + Math.sin(radians) * entity.radius;
}
```

**Example 2: Directional Shooting**

```typescript
type Projectile = {
  x: number;
  y: number;
  speed: number;
  velocityX: number;
  velocityY: number;
};

function shootProjectile(
  x: number,
  y: number,
  angleDegrees: number,
  speed: number,
): Projectile {
  const radians = degreesToRadians(angleDegrees);

  return {
    x,
    y,
    speed,
    velocityX: Math.cos(radians) * speed,
    velocityY: Math.sin(radians) * speed,
  };
}
```

### radiansToDegrees(radians)

Converts angle from radians to degrees.

**Function Signature:**

```typescript
function radiansToDegrees(radians: number): number;
```

**Use Cases:**

- Display angle values
- Convert from Math functions
- Angle comparisons
- UI displays

**Example: Calculate Aiming Angle**

```typescript
import { radiansToDegrees } from "../utilities/math.ts";

function getAimingAngle(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): number {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const radians = Math.atan2(dy, dx);

  return radiansToDegrees(radians);
}

const player = { x: 100, y: 100 };
const target = { x: 200, y: 150 };
const angle = getAimingAngle(player.x, player.y, target.x, target.y);
console.log(`Aim at ${angle.toFixed(1)}°`);
```

## Random Utilities

### randomInt(min, max)

Generates random integer between min and max (inclusive).

**Function Signature:**

```typescript
function randomInt(min: number, max: number): number;
```

**Use Cases:**

- Dice rolls
- Random spawn positions
- Random damage/reward values
- Random selection indices

**Example 1: Random Enemy Generation**

```typescript
import { randomInt } from "../utilities/random.ts";

type Enemy = {
  x: number;
  y: number;
  health: number;
  speed: number;
};

function spawnRandomEnemy(screenWidth: number, screenHeight: number): Enemy {
  return {
    x: randomInt(0, screenWidth),
    y: randomInt(0, screenHeight),
    health: randomInt(50, 100),
    speed: randomInt(1, 3),
  };
}
```

**Example 2: Random Damage Calculation**

```typescript
type Weapon = {
  minDamage: number;
  maxDamage: number;
  critChance: number;
};

function calculateDamage(weapon: Weapon): number {
  let damage = randomInt(weapon.minDamage, weapon.maxDamage);

  if (randomInt(1, 100) <= weapon.critChance) {
    damage *= 2;
    console.log("Critical hit!");
  }

  return damage;
}
```

### randomChoice(array)

Picks random element from an array.

**Function Signature:**

```typescript
function randomChoice<T>(array: T[]): T;
```

**Use Cases:**

- Random selection from options
- Random enemy types
- Random events
- Random dialogue

**Example 1: Random Power-up Spawning**

```typescript
import { randomChoice } from "../utilities/random.ts";

type PowerUpType = "health" | "speed" | "shield" | "damage";

const powerUpTypes: PowerUpType[] = ["health", "speed", "shield", "damage"];

function spawnRandomPowerUp(x: number, y: number) {
  const type = randomChoice(powerUpTypes);

  return {
    type,
    x,
    y,
    duration: 5000,
  };
}
```

**Example 2: Random Event System**

```typescript
type GameEvent = {
  name: string;
  execute: () => void;
};

const events: GameEvent[] = [
  {
    name: "enemy_wave",
    execute: () => console.log("Enemy wave incoming!"),
  },
  {
    name: "treasure_chest",
    execute: () => console.log("Treasure chest appeared!"),
  },
  {
    name: "boss_warning",
    execute: () => console.log("Boss approaching!"),
  },
];

function triggerRandomEvent() {
  const event = randomChoice(events);
  event.execute();
}
```

### shuffle(array)

Shuffles array using Fisher-Yates algorithm. Returns new array without modifying original.

**Function Signature:**

```typescript
function shuffle<T>(array: T[]): T[];
```

**Use Cases:**

- Card deck shuffling
- Random level order
- Question randomization
- Item pool randomization

**Example 1: Card Game Deck**

```typescript
import { shuffle } from "../utilities/random.ts";

type Card = {
  suit: string;
  value: number;
};

function createDeck(): Card[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value });
    }
  }

  return shuffle(deck);
}

function dealHand(deck: Card[], handSize: number): Card[] {
  return deck.slice(0, handSize);
}
```

**Example 2: Procedural Level Generation**

```typescript
type Room = {
  type: "combat" | "treasure" | "puzzle" | "shop" | "boss";
  difficulty: number;
};

function generateLevel(): Room[] {
  const rooms: Room[] = [
    { type: "combat", difficulty: 1 },
    { type: "combat", difficulty: 2 },
    { type: "treasure", difficulty: 0 },
    { type: "puzzle", difficulty: 1 },
    { type: "shop", difficulty: 0 },
    { type: "combat", difficulty: 3 },
    { type: "boss", difficulty: 5 },
  ];

  const shuffledRooms = shuffle(rooms.slice(0, -1));

  return [...shuffledRooms, rooms[rooms.length - 1]];
}
```

### weightedRandom(items)

Selects random item based on weighted probability.

**Function Signature:**

```typescript
function weightedRandom<T>(items: { value: T; weight: number }[]): T;
```

**Use Cases:**

- Loot drop systems
- Rarity systems
- Spawn probability
- AI decision making

**Example 1: Weighted Loot Drops**

```typescript
import { weightedRandom } from "../utilities/random.ts";

type LootRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

function dropLoot(): LootRarity {
  return weightedRandom([
    { value: "common" as const, weight: 50 },
    { value: "uncommon" as const, weight: 30 },
    { value: "rare" as const, weight: 15 },
    { value: "epic" as const, weight: 4 },
    { value: "legendary" as const, weight: 1 },
  ]);
}

function generateLoot(kills: number) {
  const loot: LootRarity[] = [];

  for (let i = 0; i < kills; i++) {
    loot.push(dropLoot());
  }

  return loot;
}
```

**Example 2: AI Decision Making**

```typescript
type AIAction = "attack" | "defend" | "heal" | "flee";

type AIState = {
  health: number;
  enemyNearby: boolean;
  hasPotion: boolean;
};

function chooseAction(state: AIState): AIAction {
  const actions: { value: AIAction; weight: number }[] = [];

  if (state.enemyNearby) {
    actions.push({ value: "attack", weight: 40 });
    actions.push({ value: "defend", weight: 30 });
  }

  if (state.health < 30 && state.hasPotion) {
    actions.push({ value: "heal", weight: 80 });
  }

  if (state.health < 20) {
    actions.push({ value: "flee", weight: 70 });
  }

  if (actions.length === 0) {
    return "attack";
  }

  return weightedRandom(actions);
}
```

## Advanced Patterns

### Pattern 1: Physics-Based Movement

Combining multiple utilities for realistic physics.

```typescript
import { clamp, lerp, distance } from "../utilities/math.ts";

type PhysicsEntity = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  maxSpeed: number;
  friction: number;
};

function updatePhysics(entity: PhysicsEntity, deltaTime: number) {
  entity.x += entity.velocityX * deltaTime;
  entity.y += entity.velocityY * deltaTime;

  entity.velocityX = lerp(entity.velocityX, 0, entity.friction);
  entity.velocityY = lerp(entity.velocityY, 0, entity.friction);

  const speed = Math.sqrt(entity.velocityX ** 2 + entity.velocityY ** 2);
  if (speed > entity.maxSpeed) {
    const scale = entity.maxSpeed / speed;
    entity.velocityX *= scale;
    entity.velocityY *= scale;
  }
}
```

### Pattern 2: Procedural Wave Generation

Creating randomized enemy waves with weighted difficulty.

```typescript
import { randomInt, weightedRandom, shuffle } from "../utilities/random.ts";

type EnemyType = {
  type: string;
  health: number;
  damage: number;
};

function generateWave(waveNumber: number): EnemyType[] {
  const enemyCount = randomInt(3, 5 + waveNumber);
  const enemies: EnemyType[] = [];

  for (let i = 0; i < enemyCount; i++) {
    const type = weightedRandom([
      { value: "weak", weight: Math.max(50 - waveNumber * 5, 10) },
      { value: "normal", weight: 30 },
      { value: "strong", weight: Math.min(10 + waveNumber * 3, 40) },
      { value: "boss", weight: waveNumber >= 5 ? 5 : 0 },
    ]);

    enemies.push({
      type,
      health: randomInt(20, 40) * (waveNumber * 0.5 + 1),
      damage: randomInt(5, 15) * (waveNumber * 0.3 + 1),
    });
  }

  return shuffle(enemies);
}
```

### Pattern 3: Particle System

Creating dynamic particle effects with random parameters.

```typescript
import { randomInt, randomChoice } from "../utilities/random.ts";
import { lerp, degreesToRadians } from "../utilities/math.ts";

type Particle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

function createExplosion(
  x: number,
  y: number,
  particleCount: number,
): Particle[] {
  const colors = ["#ff6b6b", "#ffa500", "#ffff00", "#ff4444"];
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = degreesToRadians(randomInt(0, 360));
    const speed = randomInt(50, 200);

    particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life: 1,
      maxLife: randomInt(500, 1500),
      size: randomInt(2, 6),
      color: randomChoice(colors),
    });
  }

  return particles;
}

function updateParticle(particle: Particle, deltaTime: number) {
  particle.x += particle.velocityX * deltaTime;
  particle.y += particle.velocityY * deltaTime;
  particle.life -= deltaTime / particle.maxLife;

  particle.velocityY += 200 * deltaTime;

  return particle.life > 0;
}
```

### Pattern 4: Smart Targeting System

Combining distance calculations with AI logic.

```typescript
import { distance, clamp } from "../utilities/math.ts";

type Target = {
  id: string;
  x: number;
  y: number;
  health: number;
  priority: number;
};

type Turret = {
  x: number;
  y: number;
  range: number;
  currentTarget: string | null;
};

function findBestTarget(turret: Turret, targets: Target[]): Target | null {
  let bestTarget: Target | null = null;
  let bestScore = -Infinity;

  for (const target of targets) {
    const dist = distance(turret.x, turret.y, target.x, target.y);

    if (dist > turret.range) continue;

    const distanceScore = (turret.range - dist) / turret.range;
    const healthScore = 1 - target.health / 100;
    const score =
      distanceScore * 0.4 + healthScore * 0.3 + target.priority * 0.3;

    if (score > bestScore) {
      bestScore = score;
      bestTarget = target;
    }
  }

  return bestTarget;
}
```

## Best Practices

1. **Use clamp for boundary constraints**: Always validate min/max bounds before use
2. **lerp for smooth transitions**: Use small t values (0.05-0.15) for smooth following
3. **Cache distance calculations**: Distance is computationally expensive
4. **Prefer radians internally**: Only convert to degrees for display
5. **Validate random ranges**: Ensure min <= max for randomInt
6. **Consider performance**: Shuffle and weightedRandom have O(n) complexity
7. **Type safety**: Use TypeScript generics with random utilities
8. **Immutability**: shuffle returns new array, preserving original

## Performance Tips

- Distance calculations use sqrt() which is expensive. For comparisons, compare squared distances
- Cache repeated calculations in game loops
- Use integer math when possible (randomInt vs random floats)
- Pre-calculate angle conversions for fixed rotations
- Reuse arrays instead of creating new ones in hot paths

## Common Pitfalls

1. **Clamping order**: `clamp(value, 0, 100)` not `clamp(0, 100, value)`
2. **lerp t value**: Should be between 0 and 1, values outside cause extrapolation
3. **Distance for collision**: Remember to add radii together
4. **Angle wrapping**: Degrees don't auto-wrap, handle 360° overflow manually
5. **Empty arrays**: randomChoice and shuffle fail on empty arrays
6. **Weight sum zero**: weightedRandom needs non-zero total weight
