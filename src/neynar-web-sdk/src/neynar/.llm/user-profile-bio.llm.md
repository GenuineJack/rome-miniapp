# UserProfileBio

**Type**: type

User bio with mentions

Bio text with structured mentions of other users and channels.

**Properties:**

- `text: string` - Bio text content
- `mentioned_profiles?: Array<UserDehydrated>` - Users mentioned in bio
- `mentioned_profiles_ranges?: Array<TextRange>` - Position ranges for user mentions (inclusive start, exclusive end)
- `mentioned_channels?: Array<ChannelDehydrated>` - Channels mentioned in bio
- `mentioned_channels_ranges?: Array<TextRange>` - Position ranges for channel mentions (inclusive start, exclusive end)

**Referenced Types:**

{@link UserDehydrated} - Minimal user data for mentions

{@link ChannelDehydrated} - Minimal channel data for mentions

{@link TextRange} - Text position range (start, end)
