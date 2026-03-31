# UserAvatar

**Type**: component

UserAvatar - Displays a user's profile picture with fallback to initials

A flexible avatar component that works with both Farcaster SDK users and Neynar API users.
Uses type guards to safely handle different property name formats (camelCase vs snake_case).

## JSX Usage

```jsx
import { UserAvatar } from "@/neynar-farcaster-sdk/mini";

<UserAvatar user={value} className="value" />;
```

## Component Props

### user

- **Type**: `Context.UserContext | NeynarUser`
- **Required**: Yes
- **Description**: No description available

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available

## Examples

// Basic usage with both user types
<UserAvatar user={farcasterUser} className="size-12" />
<UserAvatar user={neynarUser} className="size-16" />
// In lists with different sizes: size-6 (small), size-8 (default), size-12 (profile), size-16 (hero)
{friends.map(friend => (
<UserAvatar key={friend.user.fid} user={friend.user} className="size-10" />
))}

```
## Returns

A rendered avatar component with image or initials fallback
```
