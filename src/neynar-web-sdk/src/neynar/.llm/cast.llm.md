# Cast

**Type**: type

Farcaster cast

A post on Farcaster with text, embeds, reactions, and metadata.

**Core Properties:**

- `object: 'cast'` - Object type identifier
- `hash: string` - Unique cast identifier
- `author:` {@link User} - User who created the cast
- `text: string` - Cast text content
- `timestamp: string` - ISO timestamp when cast was created

**Threading & Replies:**

- `parent_hash: string | null` - Hash of parent cast if this is a reply
- `parent_url: string | null` - URL of parent if replying to URL
- `root_parent_url: string | null` - URL of root parent in thread
- `thread_hash: string | null` - Hash of thread root
- `parent_author:` {@link CastEmbeddedParentAuthor} - Author of parent cast

**Content & Embeds:**

- `embeds: Array<Embed>` - Embedded content (images, videos, URLs, casts)
- `frames?: Array<Frame>` - Interactive frames attached to cast

**Mentions:**

- `mentioned_profiles: Array<User>` - Users mentioned in text
- `mentioned_profiles_ranges: Array<TextRange>` - Position ranges for user mentions
- `mentioned_channels: Array<ChannelDehydrated>` - Channels mentioned in text
- `mentioned_channels_ranges: Array<TextRange>` - Position ranges for channel mentions

**Engagement & Context:**

- `reactions:` {@link CastReactions} - Counts of likes and recasts
- `replies:` {@link CastReplies} - Reply count
- `channel:` {@link ChannelOrChannelDehydrated} `| null` - Channel where cast was posted
- `viewer_context?:` {@link CastViewerContext} - Viewer's relationship to cast (liked, recasted, etc.)
- `author_channel_context?:` {@link ChannelUserContext} - Author's role in the channel

**Optional Properties:**

- `app?:` {@link UserDehydrated} - App used to create the cast
- `type?:` {@link CastNotificationType} - Notification type if applicable
