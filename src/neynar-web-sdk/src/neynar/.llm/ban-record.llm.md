# BanRecord

**Type**: type

Ban record

Represents a ban relationship between two Farcaster users.

**Properties:**

- `object: 'ban'` - Object type identifier (always 'ban')
- `banned?:` {@link User} - User who is banned
- `banner?:` {@link User} - User who created the ban
- `banned_at: string` - ISO timestamp when the ban was created
