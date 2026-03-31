# useUserActiveChannels

**Type**: hook

Get user's active channels

Fetches channels where the user is actively participating, either as a member,
moderator, or frequent contributor. This provides insight into the user's community
involvement and interests within the Farcaster ecosystem.

## Import

```typescript
import { useUserActiveChannels } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUserActiveChannels(
  fid: number,
  params?: UseUserActiveChannelsParams,
  options?: InfiniteQueryHookOptions<ChannelListResponse, Channel>,
): InfiniteQueryHookResult<Channel>;
```

## Parameters

### fid

- **Type**: `number`
- **Required**: Yes
- **Description**: - The Farcaster ID of the user whose active channels to fetch

### params

- **Type**: `UseUserActiveChannelsParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `viewer_fid?: number` - FID of viewing user to get channel relationship context
- `limit?: number` - Maximum number of channels to return (default: 25)

### options

- **Type**: `InfiniteQueryHookOptions<ChannelListResponse, Channel>`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
InfiniteQueryHookResult<Channel>;
```

TanStack Query infinite result with paginated channel data

- `data.pages:` Array of `Channel` with:
  Farcaster channel

A topic-based community on Farcaster.
**Core Properties:**

- `object: 'channel'` - Object type identifier
- `id: string` - Unique channel identifier
- `url: string` - Channel URL
- `name?: string` - Channel name
- `description?: string` - Channel description
- `image_url?: string` - Channel image URL
- `created_at: string` - ISO timestamp when channel was created

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

**ChannelExternalLink:**
Channel external link

External link associated with a channel.

- `title?: string` - Link title
- `url?: string` - Link URL

**ChannelUserContext:**
Channel user context

User's relationship to a channel.

- `following: boolean` - User is following the channel
- `role?: string` - User's role in the channel

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
import { useUserActiveChannels } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUserActiveChannels(123, { viewer_fid: 123, limit: 123 });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic active channels display

```tsx
function UserChannels({ fid }: { fid: number }) {
  const { data: channels, isLoading, error } = useUserActiveChannels(fid);

  if (isLoading) return <div>Loading channels...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!channels?.length) return <div>No active channels</div>;

  return (
    <div>
      <h3>Active Channels</h3>
      {channels.map((channel) => (
        <div key={channel.id}>
          <img src={channel.image_url} alt={channel.name} />
          <div>
            <h4>{channel.name}</h4>
            <p>{channel.description}</p>
            <span>{channel.follower_count} followers</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example 2

Channels with membership status

```tsx
function UserChannelsWithMembership({
  fid,
  viewerFid,
}: {
  fid: number;
  viewerFid?: number;
}) {
  const { data: channels } = useUserActiveChannels(fid, {
    viewer_fid: viewerFid,
  });

  return (
    <div>
      <h3>Communities</h3>
      {channels?.map((channel) => (
        <div key={channel.id}>
          <h4>{channel.name}</h4>
          <p>{channel.description}</p>
          {channel.viewer_context?.following && (
            <span>You're also a member</span>
          )}
        </div>
      ))}
    </div>
  );
}
```
