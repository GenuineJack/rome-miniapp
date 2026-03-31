# useRelevantFrames

**Type**: hook

Fetch relevant frames

Retrieves frames that are relevant to the current user or context based on their
activity and social graph. This endpoint provides personalized frame recommendations
with context about which users in the network are engaging with each frame.

## Import

```typescript
import { useRelevantFrames } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useRelevantFrames(
  params: UseRelevantFramesParams,
  options?: QueryHookOptions<
    FetchRelevantFrames200Response,
    FetchRelevantFrames200ResponseRelevantFramesInner[]
  >,
): QueryHookResult<FetchRelevantFrames200ResponseRelevantFramesInner[]>;
```

## Parameters

### params

- **Type**: `UseRelevantFramesParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `viewer_fid: number` - FID of viewing user for personalized recommendations
- `time_window?: string` - Time window for limiting statistics used to calculate relevance. Valid values: '1h', '6h', '12h', '24h', '7d'
- `networks?: string[]` - Filter by blockchain networks. Valid values: 'ethereum', 'base', 'arbitrum', 'arbitrum-sepolia', 'base-sepolia', 'degen', 'gnosis', 'optimism', 'optimism-sepolia', 'polygon', 'ethereum-sepolia', 'zora', 'unichain', 'monad-testnet', 'celo', 'solana'

### options

- **Type**: `QueryHookOptions<
  FetchRelevantFrames200Response,
  FetchRelevantFrames200ResponseRelevantFramesInner[]
  > `
- **Required**: No
- **Description**: - Optional query configuration options

## Returns

```typescript
QueryHookResult<FetchRelevantFrames200ResponseRelevantFramesInner[]>;
```

TanStack Query result containing array of relevant frames with user context

- `data:` `FetchRelevantFrames200ResponseRelevantFramesInner` with:
  Relevant frame item

Frame with relevant user information.

- `frame: FetchRelevantFrames200ResponseRelevantFramesInnerFrame` - Frame object
- `top_relevant_users:` User`[]` - Array of the most relevant users
- `remaining_relevant_users:` UserDehydrated`[]` - Array of remaining relevant users in dehydrated form

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
import { useRelevantFrames } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useRelevantFrames(/* value */, []);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Personalized frame recommendations

```tsx
const { data: relevantFrames, isLoading } = useRelevantFrames(
  {
    viewer_fid: 123,
  },
  {
    onSuccess: (frames) => {
      console.log(`Found ${frames.length} relevant frames`);
    },
  },
);

return (
  <div>
    {relevantFrames?.map((item) => (
      <div key={item.frame.frames_url}>
        <h3>{item.frame.title}</h3>
        <div>
          {item.top_relevant_users.map((user) => (
            <img key={user.fid} src={user.pfp_url} alt={user.display_name} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
```
