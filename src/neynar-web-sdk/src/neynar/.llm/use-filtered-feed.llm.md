# useFilteredFeed

**Type**: hook

Hook for fetching filtered content feed with infinite scrolling and custom parameters

Retrieves posts based on flexible filtering criteria, providing the most versatile
feed option with support for complex content discovery needs. This is the general-purpose
feed endpoint that can be customized with various filtering parameters.

## Import

```typescript
import { useFilteredFeed } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFilteredFeed(
  params?: UseFilteredFeedParams,
  options?: InfiniteQueryHookOptions<FeedResponse, Cast>,
): InfiniteQueryHookResult<Cast>;
```

## Parameters

### params

- **Type**: `UseFilteredFeedParams`
- **Required**: No
- **Description**: Additional query parameters (see properties below)

**params properties:**

- `cursor?: string` - Pagination cursor for fetching specific page (automatically managed in infinite queries)
- `limit?: number` - Number of results to fetch per page (Default: 25, Maximum: 100)
- `feed_type?: "following" | "filter"` - Feed type (Default: 'following' which requires FID, 'filter' requires filter_type parameter)
- `filter_type?: | "fids"
| "parent_url"
| "channel_id"
| "embed_url"
| "embed_types"
| "global_trending"` - Filter type when feed_type='filter'
- `fid?: number` - User's Farcaster ID (required for feed_type='following')
- `fids?: string` - Comma separated list of FIDs (when filter_type='fids', max: 100)
- `parent_url?: string` - Parent URL to filter by (when filter_type='parent_url')
- `channel_id?: string` - Channel ID to filter by (when filter_type='channel_id')
- `members_only?: boolean` - Only include casts from channel members (when filter_type='channel_id', Default: true)
- `embed_url?: string` - Embedded URL prefix to filter by (when filter_type='embed_url')
- `embed_types?: string[]` - Array of content embed types to filter by (when filter_type='embed_types')
- `viewer_fid?: number` - FID of viewer for personalized content (respects mutes/blocks, includes viewer_context)
- `with_recasts?: boolean` - Include recasts in response (Default: true)

### options

- **Type**: `InfiniteQueryHookOptions<FeedResponse, Cast>`
- **Required**: No
- **Description**: - TanStack Query options for caching and pagination behavior

## Returns

```typescript
InfiniteQueryHookResult<Cast>;
```

TanStack Query infinite result with paginated cast data

- `data.pages:` Array of `Cast` with:
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

**Referenced Types:**

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

**CastNotificationType:**
Cast notification type

Type of notification associated with a cast.

**Values:**

- `'follows'` - Follow notification
- `'recasts'` - Recast notification
- `'likes'` - Like notification
- `'mention'` - Mention notification
- `'reply'` - Reply notification

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

## Usage

```typescript
import { useFilteredFeed } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFilteredFeed({ cursor: "example", limit: 123 });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function FilteredFeed() {
  const { data, fetchNextPage, hasNextPage } = useFilteredFeed({
    feed_type: "filter",
    filter_type: "channel_id",
    channel_id: "warpcast",
    viewer_fid: 123,
    limit: 100,
  });
  const casts = data?.pages.flatMap((p) => p.items) || [];
  return <CastList casts={casts} />;
}
```
