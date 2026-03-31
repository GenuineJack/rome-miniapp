# useScorePopup

**Type**: hook

Floating score popup hook

Creates floating "+100" style text that fades up and disappears.
Automatically cleans up after animation completes (~1000ms).

## Import

```typescript
import { useScorePopup } from "@/neynar-farcaster-sdk/game";
```

## Hook Signature

```typescript
function useScorePopup(): UseQueryResult | UseMutationResult;
```

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object with popups array and show function

## Usage

```typescript
import { useScorePopup } from '@/neynar-farcaster-sdk/game';

function MyComponent() {
  const result = useScorePopup();

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```typescript
const { popups, show } = useScorePopup();

// Player collects coin
show(coinX, coinY, 100);

// Render popups
{popups.map(popup => (
  <div
    key={popup.id}
    style={{
      position: 'absolute',
      left: popup.x,
      top: popup.y - (1 - popup.life) * 50,
      opacity: popup.life,
      fontSize: '24px',
      fontWeight: 'bold',
      color: popup.value > 0 ? '#00FF00' : '#FF0000',
    }}
  >
    {popup.value > 0 ? '+' : ''}{popup.value}
  </div>
))}
```
