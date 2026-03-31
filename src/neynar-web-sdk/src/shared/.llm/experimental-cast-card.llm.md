# ExperimentalCastCard

**Type**: component

ExperimentalCastCard - A comprehensive Farcaster cast display component ⚠️ **EXPERIMENTAL**: This component is under active development and may change. Displays a Farcaster cast with full support for: - Author information (avatar, display name, username, power badge) - Cast text content with proper text wrapping - Image and link embeds - Nested/quoted casts (recursive rendering) - Engagement metrics (likes, recasts, replies) - Interactive click handlers for cast and author Built using

## JSX Usage

```jsx
import { ExperimentalCastCard } from '@/neynar-web-sdk/client';

<ExperimentalCastCard
  cast={value}
  onCastClick={handleCastClick}
  onAuthorClick={handleAuthorClick}
  className=""
  nested=false
/>
```

## Component Props

### cast

- **Type**: `Cast`
- **Required**: Yes
- **Description**: No description available

### onCastClick

- **Type**: `(cast: Cast) => void`
- **Required**: No
- **Description**: No description available

### onAuthorClick

- **Type**: `(cast: Cast) => void`
- **Required**: No
- **Description**: No description available

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: ""

### nested

- **Type**: `boolean`
- **Required**: No
- **Description**: No description available
- **Default**: false
