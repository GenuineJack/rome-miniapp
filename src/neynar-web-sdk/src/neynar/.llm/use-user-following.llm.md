# useUserFollowing

**Type**: hook

Get users that a user is following with infinite scroll pagination

Fetches users that the specified user follows with TanStack Query infinite scroll support.
Results are paginated and can be loaded incrementally as needed. Includes viewer context
for relationship information when available.

## Import

```typescript
import { useUserFollowing } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useUserFollowing(
  fid: number,
  params?: UseUserFollowingParams,
  options?: InfiniteQueryHookOptions<FollowersResponse, Follower>,
): InfiniteQueryHookResult<Follower>;
```

## Parameters

### fid

- **Type**: `number`
- **Required**: Yes
- **Description**: - The Farcaster ID of the user whose following list to fetch

### params

- **Type**: `UseUserFollowingParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `viewer_fid?: number` - FID of viewing user to get relationship context (adds viewer_context to response)
- `sort_type?: "desc_chron" | "algorithmic"` - Sort order: desc_chron (most recent first) or algorithmic (Neynar's algorithm)
- `x_neynar_experimental?: boolean` - Enable experimental features including Neynar score filtering
- `limit?: number` - Number of results per page (default: 25, max: 100)

### options

- **Type**: `InfiniteQueryHookOptions<FollowersResponse, Follower>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
InfiniteQueryHookResult<Follower>;
```

TanStack Query infinite result with paginated following data

- `data.pages:` Array of `Follower` with:
  Follower

A user following relationship.

- `object: "follower"` - Type identifier
- `user:` User - The follower user
- `app?:` UserDehydrated - Optional app context

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
import { useUserFollowing } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useUserFollowing(123, { viewer_fid: 123, sort_type: "desc_chron" });

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic following list with infinite scroll

```tsx
function UserFollowing({ fid }: { fid: number }) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserFollowing(fid);

  if (isLoading) return <div>Loading following...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const following = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      <h2>Following ({following.length}+)</h2>
      {following.map((follower) => (
        <div key={follower.user.fid}>
          <img src={follower.user.pfp_url} alt={follower.user.display_name} />
          <div>
            <h3>{follower.user.display_name}</h3>
            <p>
              @{follower.user.username} • {follower.user.follower_count}{" "}
              followers
            </p>
          </div>
        </div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

### Example 2

Following list with relationship indicators

```tsx
function FollowingWithRelationships({
  fid,
  viewerFid,
}: {
  fid: number;
  viewerFid?: number;
}) {
  const { data } = useUserFollowing(fid, { viewer_fid: viewerFid });
  const following = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      {following.map((follower) => (
        <div key={follower.user.fid}>
          <h4>
            {follower.user.display_name} (@{follower.user.username})
          </h4>
          <div>
            {follower.user.viewer_context?.following && <span>You follow</span>}
            {follower.user.viewer_context?.followed_by && (
              <span>Follows you</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Example 3

Following list with algorithmic sorting

```tsx
function AlgorithmicFollowing({ fid }: { fid: number }) {
  const { data } = useUserFollowing(fid, {
    sort_type: "algorithmic",
    x_neynar_experimental: true,
  });
  const following = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div>
      <h2>Top Following (Algorithmic)</h2>
      {following.map((follower) => (
        <div key={follower.user.fid}>{follower.user.display_name}</div>
      ))}
    </div>
  );
}
```
