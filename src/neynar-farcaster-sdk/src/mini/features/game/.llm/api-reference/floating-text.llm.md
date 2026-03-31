# FloatingText

**Type**: component

Floating text component

Renders floating score popups from useScorePopup hook.
Shows "+100" or "-50" style text that floats up and fades out.

## JSX Usage

```jsx
import { FloatingText } from "@/neynar-farcaster-sdk/game";

<FloatingText popups={[]} className="" />;
```

## Component Props

### popups

- **Type**: `ScorePopup[]`
- **Required**: Yes
- **Description**: Array of score popups to render

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { popups, show } = useScorePopup();
return (

  <div className="relative">
    <FloatingText popups={popups} />
    <button onClick={() => show(200, 200, 100)}>
      +100
    </button>
  </div>
);
```
