# ExperimentalCastCard

**Type**: component

ExperimentalCastCard - A comprehensive Farcaster cast display component

⚠️ **EXPERIMENTAL**: This component is under active development and may change.

Displays a Farcaster cast with full support for:

- Author information (avatar, display name, username, power badge)
- Cast text content with proper text wrapping
- Image and link embeds
- Nested/quoted casts (recursive rendering)
- Engagement metrics (likes, recasts, replies)
- Interactive click handlers for cast and author

Built using

## JSX Usage

```jsx
import { ExperimentalCastCard } from '@/neynar-web-sdk/neynar';

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

## Examples

### Example 1

```tsx
import { ExperimentalCastCard } from "@/neynar-web-sdk/client";
import { useCastsByUser } from "@/neynar-web-sdk/neynar-api/hooks";
function UserCastFeed({ fid }: { fid: number }) {
  const { data: casts, isLoading } = useCastsByUser(fid);
  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="space-y-4">
      {casts?.map((cast) => (
        <ExperimentalCastCard key={cast.hash} cast={cast} />
      ))}
    </div>
  );
}
```

### Example 2

```tsx
import { ExperimentalCastCard } from "@/neynar-web-sdk/client";
import { useRouter } from "next/navigation";
function InteractiveCastFeed() {
  const router = useRouter();
  const { data: casts } = useChannelFeed("pokemon");
  return (
    <div className="space-y-4">
      {casts?.map((cast) => (
        <ExperimentalCastCard
          key={cast.hash}
          cast={cast}
          onCastClick={(cast) => router.push(`/cast/${cast.hash}`)}
          onAuthorClick={(cast) => router.push(`/user/${cast.author.username}`)}
        />
      ))}
    </div>
  );
}
```

### Example 3

```tsx
import { ExperimentalCastCard } from "@/neynar-web-sdk/client";
import { Dialog, DialogContent } from "@neynar/ui";
function CastModal({ cast, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <ExperimentalCastCard cast={cast} />
      </DialogContent>
    </Dialog>
  );
}
```
