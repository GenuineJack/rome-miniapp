# useUserReactions

**Type**: hook

Fetches reactions for a given user with infinite scroll pagination

Retrieves all reactions (likes and recasts) made by a specific user. Each reaction
includes the complete cast that was reacted to.

## Import

```typescript
import { useUserReactions } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUserReactions(
  fid: number,
  type: "all" | "likes" | "recasts",
  params?: UseUserReactionsParams,
  options?: InfiniteQueryHookOptions<ReactionsResponse, ReactionWithCastInfo>,
): InfiniteQueryHookResult<ReactionWithCastInfo>;
```

## Parameters

### fid

- **Type**: `number`
- **Required**: Yes
- **Description**: - The Farcaster ID of the user whose reactions to fetch

### type

- **Type**: `"all" | "likes" | "recasts"`
- **Required**: Yes
- **Description**: - Type of reaction to fetch ("all" | "likes" | "recasts", default: "all")

### params

- **Type**: `UseUserReactionsParams`
- **Required**: No
- **Description**: Additional query parameters (see properties below)

**params properties:**

- `viewer_fid?: number` - FID of viewing user for personalized results

When provided, returns reactions that respect this user's mutes and blocks
and includes `viewer_context` on each cast with relationship information.

- `limit?: number` - Number of results to fetch per page

- Default: 25
- Maximum: 100
- Minimum: 1

### options

- **Type**: `InfiniteQueryHookOptions<ReactionsResponse, ReactionWithCastInfo>`
- **Required**: No
- **Description**: - TanStack Query options for caching and pagination behavior

## Returns

```typescript
InfiniteQueryHookResult<ReactionWithCastInfo>;
```

TanStack Query infinite result with paginated reaction data

- `data.pages:` Array of `ReactionWithCastInfo` with:
  Reaction with cast information

Represents a user reaction (like or recast) with full cast details.

- `reaction_type: 'like' | 'recast'` - Type of reaction
- `app?:` UserDehydrated - App through which the reaction was made
- `cast:` Cast - The cast that was reacted to
- `reaction_timestamp: string` - ISO timestamp when the reaction was made
- `object: 'likes' | 'recasts'` - Object type identifier
- `user:` UserDehydrated - User who made the reaction

**Referenced Types:**

**UserDehydrated:**
Minimal user data

Lightweight user object with core identification fields.
Used for mentions, relationships, and nested references.

- `object: 'user_dehydrated'` - Object type identifier
- `fid: number` - Unique Farcaster identifier
- `username?: string` - User's handle (without @ prefix)
- `display_name?: string` - User's display name
- `pfp_url?: string` - Profile picture URL
- `custody_address?: string` - Ethereum custody address
- `score?: number` - Spam probability score

**Cast:**
Farcaster cast

A post on Farcaster with text, embeds, reactions, and metadata.
**Core Properties:**

- `object: 'cast'` - Object type identifier
- `hash: string` - Unique cast identifier
- `author:` User - User who created the cast
- `text: string` - Cast text content
- `timestamp: string` - ISO timestamp when cast was created
  **Optional Properties:**
- `app?:` UserDehydrated - App used to create the cast
- `type?:` CastNotificationType - Notification type if applicable

**User:**
Farcaster user profile from Neynar SDK

Complete user profile with social metadata, verifications, and optional viewer context.

- `fid: number` - Unique Farcaster identifier
- `username: string` - User's handle (without @ prefix)
- `display_name?: string` - User's display name
- `pfp_url?: string` - Profile picture URL
- `profile:` UserProfile - Contains bio (with mentioned profiles/channels), location, banner
- `custody_address: string` - Ethereum custody address
- `follower_count: number` - Number of followers
- `following_count: number` - Number of users being followed
- `verifications: Array<string>` - Verified addresses
- `verified_addresses:` UserVerifiedAddresses - Structured verified addresses (eth_addresses, sol_addresses, primary)
- `verified_accounts:` UserVerifiedAccountsInner`[]` - Connected social accounts
- `auth_addresses:` UserAuthAddressesInner`[]` - Authentication addresses
- `power_badge: boolean` - Power badge status
- `viewer_context?:` UserViewerContext - Present when viewer_fid provided (shows relationship status)
- `score?: number` - Spam probability score (present when x_neynar_experimental enabled)
- `experimental?:` UserExperimental - Experimental features data
- `pro?:` UserPro - Pro subscription status

**UserProfile:**
User profile information

Contains user bio, location, and banner image.

- `bio:` UserProfileBio - User bio with mentioned profiles and channels
- `location?:` Location - User's location (city, state, country)
- `banner?:` UserProfileBanner - Banner image data

**UserProfileBio:**
User bio with mentions

Bio text with structured mentions of other users and channels.

- `text: string` - Bio text content
- `mentioned_profiles?: Array<UserDehydrated>` - Users mentioned in bio
- `mentioned_profiles_ranges?: Array<TextRange>` - Position ranges for user mentions (inclusive start, exclusive end)
- `mentioned_channels?: Array<ChannelDehydrated>` - Channels mentioned in bio
- `mentioned_channels_ranges?: Array<TextRange>` - Position ranges for channel mentions (inclusive start, exclusive end)

**ChannelDehydrated:**
Channel dehydrated

Minimal channel data for nested references.

- `object: 'channel_dehydrated'` - Object type identifier
- `id: string` - Channel identifier
- `url: string` - Channel URL
- `name?: string` - Channel name
- `image_url?: string` - Channel image URL

**TextRange:**
Text range

Position range within text (for mentions, etc.).

- `start: number` - Start position (inclusive)
- `end: number` - End position (exclusive)

**Location:**
Geographic location

Coordinates and place names for a location.

- `latitude: number` - Latitude coordinate
- `longitude: number` - Longitude coordinate
- `address?:` LocationAddress - Structured address (city, state, country)
- `radius?: number` - Radius in meters for location search

**LocationAddress:**
Location address

Structured address information.

- `city?: string` - City name
- `state?: string` - State/province name
- `country?: string` - Country name

**UserProfileBanner:**
User profile banner

Banner image for user profile.

- `url?: string` - URL of the user's banner image

**UserVerifiedAddresses:**
User verified addresses

Contains all verified blockchain addresses for the user.

- `eth_addresses: Array<string>` - Verified Ethereum addresses (oldest to newest)
- `sol_addresses: Array<string>` - Verified Solana addresses (oldest to newest)
- `primary:` UserVerifiedAddressesPrimary - Primary verified addresses

**UserVerifiedAddressesPrimary:**
Primary verified addresses

The user's primary Ethereum and Solana addresses.

- `eth_address: string | null` - Primary Ethereum address
- `sol_address: string | null` - Primary Solana address

**UserVerifiedAccountsInner:**
User verified account

A connected and verified social media account (e.g., Twitter, GitHub).

- `platform?: 'x' | 'github'` - Platform name
- `username?: string` - Username on the platform

**UserAuthAddressesInner:**
User authentication address

An address used for user authentication.

- `address: string` - Ethereum address
- `app:` UserDehydrated - App associated with this auth address

**UserViewerContext:**
User viewer context

Relationship status between the viewing user and this user.
Only present when `viewer_fid` parameter is provided.

- `following: boolean` - Viewer follows this user
- `followed_by: boolean` - This user follows viewer
- `blocking: boolean` - Viewer blocks this user
- `blocked_by: boolean` - This user blocks viewer

**UserExperimental:**
User experimental features

Experimental feature data for the user.
Only present when `x_neynar_experimental` parameter is enabled.

- `deprecation_notice?: string` - Notice about deprecated features
- `neynar_user_score: number` - Score representing probability that account is not spam

**UserPro:**
User Pro subscription

Information about the user's Pro subscription status.

- `status: 'subscribed' | 'unsubscribed'` - Pro subscription status
- `subscribed_at: string` - ISO timestamp when Pro was subscribed
- `expires_at: string` - ISO timestamp when Pro expires

**CastEmbeddedParentAuthor:**
Cast embedded parent author

Author information for parent cast.

- `fid?: number` - Farcaster ID of parent author

**CastReactions:**
Cast reactions

Counts of reactions on a cast.

- `likes_count: number` - Number of likes
- `recasts_count: number` - Number of recasts
- `likes: Array<ReactionWithUserInfo>` - Like reactions with user info
- `recasts: Array<ReactionWithUserInfo>` - Recast reactions with user info

**CastReplies:**
Cast replies

Reply count for a cast.

- `count: number` - Number of replies

**ChannelOrChannelDehydrated:**
Channel or channel dehydrated

Union type for full or minimal channel data.

**CastViewerContext:**
Cast viewer context

Viewer's relationship to a cast.

- `liked: boolean` - Viewer has liked this cast
- `recasted: boolean` - Viewer has recasted this cast

**ChannelUserContext:**
Channel user context

User's relationship to a channel.

- `following: boolean` - User is following the channel
- `role?: string` - User's role in the channel

**CastNotificationType:**
Cast notification type

Type of notification associated with a cast.

**Values:**

- `'follows'` - Follow notification
- `'recasts'` - Recast notification
- `'likes'` - Like notification
- `'mention'` - Mention notification
- `'reply'` - Reply notification

## Usage

```typescript
import { useUserReactions } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUserReactions(123, "all");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic user likes feed

```tsx
function UserReactions({ fid }: { fid: number }) {
  const { data, fetchNextPage, hasNextPage } = useUserReactions(fid, "likes");
  const reactions = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      {reactions.map((r) => (
        <div key={r.cast.hash}>
          <p>{r.cast.text}</p>
          <small>
            Liked at {new Date(r.reaction_timestamp).toLocaleDateString()}
          </small>
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
    </div>
  );
}
```
