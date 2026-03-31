# ScreenShakeContainer

**Type**: component

Screen shake container component

Wraps game content and applies shake transform from useScreenShake hook.
Only applies transform when isShaking is true.

## JSX Usage

```jsx
import { ScreenShakeContainer } from "@/neynar-farcaster-sdk/game";

<ScreenShakeContainer isShaking={true} offset={value} className="">
  {/* Your content here */}
</ScreenShakeContainer>;
```

## Component Props

### children

- **Type**: `ReactNode`
- **Required**: Yes
- **Description**: Game content to shake

### isShaking

- **Type**: `boolean`
- **Required**: Yes
- **Description**: Whether shake is active

### offset

- **Type**: `{ x: number; y: number }`
- **Required**: Yes
- **Description**: X/Y offset from useScreenShake

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { shake, isShaking, offset } = useScreenShake();
return (
<ScreenShakeContainer isShaking={isShaking} offset={offset}>
<YourGame />
<button onClick={() => shake(8, 500)}>Shake!</button>
</ScreenShakeContainer>
);

```

```
