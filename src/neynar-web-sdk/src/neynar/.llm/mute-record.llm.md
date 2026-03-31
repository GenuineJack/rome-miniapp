# MuteRecord

**Type**: type

Mute record

Represents a mute relationship between two Farcaster users.

**Properties:**

- `object: 'mute'` - Object type identifier (always 'mute')
- `muted:` {@link User} - User who is muted
- `muted_at: string` - ISO timestamp when the mute was created
