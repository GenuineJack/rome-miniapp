# useParticles

**Type**: hook

Particle emitter hook for visual effects

Creates particles for confetti, explosions, sparkles, etc.
Particles move based on velocity and gravity, fading out over time.

## Import

```typescript
import { useParticles } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useParticles(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with particles array, emit function, and clear function

## Usage

```typescript
import { useParticles } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useParticles();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { particles, emit } = useParticles();

// Player scores
emit({
  x: playerX,
  y: playerY,
  count: 30,
  colors: ['#FFD700', '#FFA500'],
  spread: 180, // Upward cone
});

// Render particles
{particles.map(p => (
  <div
    key={p.id}
    style={{
      position: 'absolute',
      left: p.x,
      top: p.y,
      width: p.size,
      height: p.size,
      backgroundColor: p.color,
      opacity: p.life,
      borderRadius: '50%',
    }}
  />
))}
```
