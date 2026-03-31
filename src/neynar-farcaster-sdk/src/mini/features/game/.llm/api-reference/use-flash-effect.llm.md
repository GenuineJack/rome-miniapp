# useFlashEffect

**Type**: hook

Full-screen flash effect hook

Creates full-screen color flash for damage, power-ups, or transitions.
Fades in quickly, then fades out slowly.

## Import

```typescript
import { useFlashEffect } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useFlashEffect(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with flash function, flashing state, opacity, and color

## Usage

```typescript
import { useFlashEffect } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useFlashEffect();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { flash, flashOpacity, flashColor } = useFlashEffect();

// Player takes damage
flash('rgba(255, 0, 0, 0.5)', 300); // Red flash

// Render overlay
{flashOpacity > 0 && (
  <div
    className="fixed inset-0 pointer-events-none"
    style={{ backgroundColor: flashColor, opacity: flashOpacity }}
  />
)}
```
