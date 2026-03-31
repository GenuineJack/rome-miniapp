# useSubscribedTo

**Type**: hook

Fetch what FIDs and contracts a FID is subscribed to

**Special Behaviors:**

- Not paginated (returns all subscriptions in single request)
- Only supports "fabric_stp" provider

## Import

```typescript
import { useSubscribedTo } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useSubscribedTo(
  params: UseSubscribedToParams,
  options?: QueryHookOptions<SubscribedToResponse, SubscribedTo[]>,
): QueryHookResult<SubscribedTo[]>;
```

## Parameters

### params

- **Type**: `UseSubscribedToParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)
- `viewer_fid?: number` - When provided, adds `viewer_context` to each creator's user object with relationship status
- `subscription_provider: "fabric_stp"` - The provider of the subscription (only "fabric_stp" is currently supported)

### options

- **Type**: `QueryHookOptions<SubscribedToResponse, SubscribedTo[]>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<SubscribedTo[]>;
```

TanStack Query result with subscribed-to data

- `data:` `SubscribedTo` with:
  Subscribed to

Represents a subscription relationship with full details including creator info.

- `object: 'subscription'` - Object type identifier (always 'subscription')
- `provider_name?: string` - Name of the subscription provider
- `contract_address: string` - Smart contract address for the subscription
- `chain: number` - Blockchain chain ID
- `metadata:` SubscriptionMetadata - Subscription metadata (name, description, etc.)
- `owner_address: string` - Address of the subscription contract owner
- `price:` SubscriptionPrice - Pricing information for the subscription
- `tiers?: Array<SubscriptionTier>` - Available subscription tiers
- `protocol_version: number` - Version of the subscription protocol
- `token:` SubscriptionToken - Token information for payment
- `expires_at: string` - ISO timestamp when the subscription expires
- `subscribed_at: string` - ISO timestamp when the subscription started
- `tier:` SubscriptionTier - Current subscription tier
- `creator:` User - User who created the subscription

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
import { useSubscribedTo } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useSubscribedTo(/* value */, []);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic subscribed-to list

```tsx
function UserSubscribedTo({ fid }: { fid: number }) {
  const { data: subscriptions, isLoading } = useSubscribedTo({
    fid,
    subscription_provider: "fabric_stp",
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Subscribed To ({subscriptions?.length || 0})</h2>
      {subscriptions?.map((sub) => (
        <div key={sub.contract_address}>
          <h3>{sub.metadata.title}</h3>
          <p>By: {sub.creator.display_name}</p>
        </div>
      ))}
    </div>
  );
}
```
