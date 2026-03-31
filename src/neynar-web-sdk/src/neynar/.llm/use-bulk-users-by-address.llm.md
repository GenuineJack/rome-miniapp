# useBulkUsersByAddress

**Type**: hook

Get users by their wallet addresses

Efficiently fetches users associated with cryptocurrency wallet addresses.
Supports multiple address types including Ethereum addresses, ENS domains,
and other blockchain addresses. Useful for wallet-based user discovery.

## Import

```typescript
import { useBulkUsersByAddress } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useBulkUsersByAddress(
  addresses: string[],
  addressTypes?: string[],
  params?: UseBulkUsersByAddressParams,
  options?: QueryHookOptions<BulkUsersByAddressResponse, User[]>,
): QueryHookResult<User[]>;
```

## Parameters

### addresses

- **Type**: `string[]`
- **Required**: Yes
- **Description**: - Array of wallet addresses to look up (supports various formats including 0x, ENS, .sol)

### addressTypes

- **Type**: `string[]`
- **Required**: No
- **Description**: - Optional array specifying address types (e.g., ['ethereum', 'solana'])

### params

- **Type**: `UseBulkUsersByAddressParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `viewer_fid?: number` - FID of viewing user to get relationship context

### options

- **Type**: `QueryHookOptions<BulkUsersByAddressResponse, User[]>`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
QueryHookResult<User[]>;
```

TanStack Query result containing array of user data

- `data:` `User` with:
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

**Referenced Types:**

**UserProfile:**
User profile information

Contains user bio, location, and banner image.

- `bio:` UserProfileBio - User bio with mentioned profiles and channels
- `location?:` Location - User's location (city, state, country)
- `banner?:` UserProfileBanner - Banner image data

**UserVerifiedAddresses:**
User verified addresses

Contains all verified blockchain addresses for the user.

- `eth_addresses: Array<string>` - Verified Ethereum addresses (oldest to newest)
- `sol_addresses: Array<string>` - Verified Solana addresses (oldest to newest)
- `primary:` UserVerifiedAddressesPrimary - Primary verified addresses

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

**UserVerifiedAddressesPrimary:**
Primary verified addresses

The user's primary Ethereum and Solana addresses.

- `eth_address: string | null` - Primary Ethereum address
- `sol_address: string | null` - Primary Solana address

## Usage

```typescript
import { useBulkUsersByAddress } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useBulkUsersByAddress("example", "example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic wallet-based user lookup

```tsx
function WalletUsers() {
  const walletAddresses = [
    "0x8E9bFa938E3631B9351A83DdA88C1f89d79E7585",
    "0x742aBb4b2B3bd86D3dB2E9e6f7f0Fe7b98E5D2a1",
  ];

  const {
    data: users,
    isLoading,
    error,
  } = useBulkUsersByAddress(walletAddresses);

  if (isLoading) return <div>Looking up wallet owners...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!users?.length) return <div>No users found for these addresses</div>;

  return (
    <div>
      <h2>Wallet Owners</h2>
      {users.map((user) => (
        <div key={user.fid}>
          <h3>
            {user.display_name} (@{user.username})
          </h3>
          <p>FID: {user.fid}</p>
          {user.verified_addresses?.eth_addresses?.map((address) => (
            <code key={address}>{address}</code>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Example 2

With specific address types and viewer context

```tsx
function EthereumUsers({
  addresses,
  viewerFid,
}: {
  addresses: string[];
  viewerFid?: number;
}) {
  const { data: users } = useBulkUsersByAddress(
    addresses,
    ["ethereum"], // Only look for Ethereum addresses
    { viewer_fid: viewerFid },
  );

  return (
    <div>
      {users?.map((user) => (
        <div key={user.fid}>
          <h4>{user.display_name}</h4>
          <div>
            {user.verified_addresses?.eth_addresses?.map((addr) => (
              <div key={addr}>
                <code>
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                </code>
                {user.viewer_context?.following && <span>Following</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```
