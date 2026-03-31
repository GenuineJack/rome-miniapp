# BlockRecord

**Type**: type

Block record

Represents a block relationship between two Farcaster users.

**Properties:**

- `object: 'block'` - Object type identifier (always 'block')
- `blocked?:` {@link User} - User who is blocked
- `blocker?:` {@link User} - User who created the block
- `blocked_at: string` - ISO timestamp when the block was created
