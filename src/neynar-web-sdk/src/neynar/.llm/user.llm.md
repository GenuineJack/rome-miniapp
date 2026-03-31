# User

**Type**: type

Farcaster user profile from Neynar SDK

Complete user profile with social metadata, verifications, and optional viewer context.

**Properties:**

- `fid: number` - Unique Farcaster identifier
- `username: string` - User's handle (without @ prefix)
- `display_name?: string` - User's display name
- `pfp_url?: string` - Profile picture URL
- `profile:` {@link UserProfile} - Contains bio (with mentioned profiles/channels), location, banner
- `custody_address: string` - Ethereum custody address
- `follower_count: number` - Number of followers
- `following_count: number` - Number of users being followed
- `verifications: Array<string>` - Verified addresses
- `verified_addresses:` {@link UserVerifiedAddresses} - Structured verified addresses (eth_addresses, sol_addresses, primary)
- `verified_accounts:` {@link UserVerifiedAccountsInner}`[]` - Connected social accounts
- `auth_addresses:` {@link UserAuthAddressesInner}`[]` - Authentication addresses
- `power_badge: boolean` - Power badge status
- `viewer_context?:` {@link UserViewerContext} - Present when viewer_fid provided (shows relationship status)
- `score?: number` - Spam probability score (present when x_neynar_experimental enabled)
- `experimental?:` {@link UserExperimental} - Experimental features data
- `pro?:` {@link UserPro} - Pro subscription status
