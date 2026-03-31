# ReactionForCast

**Type**: type

Reaction for cast

Represents a single reaction on a cast with user information.

**Properties:**

- `reaction_type:` {@link ReactionType} - Type of reaction ('like' or 'recast')
- `app?:` {@link UserDehydrated} - App through which the reaction was made
- `reaction_timestamp: string` - ISO timestamp when the reaction was made
- `object: 'likes' | 'recasts'` - Object type identifier
- `user:` {@link User} - User who made the reaction

**Usage Context:**

- Used in cast reaction listings
- Includes full user data (unlike {@link ReactionWithUserInfo} which has minimal data)
