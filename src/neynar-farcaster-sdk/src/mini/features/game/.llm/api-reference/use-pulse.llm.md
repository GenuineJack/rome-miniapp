# usePulse

**Type**: hook

Pulse/scale animation utility for UI elements

Pulses element when trigger value changes.
Animates scale from 1.0 → 1.2 → 1.0 over ~300ms.

## Import

```typescript
import { usePulse } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function usePulse(trigger: unknown): UseQueryResult | UseMutationResult;
```

## Parameters

### trigger

- **Type**: `unknown`
- **Required**: Yes
- **Description**: No description available

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with current scale value

## Usage

```typescript
import { usePulse } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = usePulse(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { scale } = usePulse(score); // Pulse when score changes

<div style={{ transform: `scale(${scale})` }}>
  Score: {score}
</div>
```
