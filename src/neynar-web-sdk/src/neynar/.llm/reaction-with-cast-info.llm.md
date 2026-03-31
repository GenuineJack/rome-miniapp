# ReactionWithCastInfo

**Type**: type

Reaction with cast information

Represents a user reaction (like or recast) with full cast details.

**Properties:**

- `reaction_type: 'like' | 'recast'` - Type of reaction
- `app?:` {@link UserDehydrated} - App through which the reaction was made
- `cast:` {@link Cast} - The cast that was reacted to
- `reaction_timestamp: string` - ISO timestamp when the reaction was made
- `object: 'likes' | 'recasts'` - Object type identifier
- `user:` {@link UserDehydrated} - User who made the reaction
