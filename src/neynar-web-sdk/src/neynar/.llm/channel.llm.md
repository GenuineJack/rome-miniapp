# Channel

**Type**: type

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

**Community & Moderation:**

- `follower_count?: number` - Number of followers
- `member_count?: number` - Number of members
- `lead?:` {@link User} - Channel lead/owner
- `moderator_fids?: Array<number>` - FIDs of channel moderators

**Content & Links:**

- `parent_url?: string` - Parent URL for the channel
- `pinned_cast_hash?: string` - Hash of pinned cast
- `external_link?:` {@link ChannelExternalLink} - External link for channel

**Mentions:**

- `description_mentioned_profiles?: Array<UserDehydrated>` - Users mentioned in description
- `description_mentioned_profiles_ranges?: Array<TextRange>` - Position ranges for mentions

**Viewer Context:**

- `viewer_context?:` {@link ChannelUserContext} - Viewer's relationship to channel (following, role, etc.)
