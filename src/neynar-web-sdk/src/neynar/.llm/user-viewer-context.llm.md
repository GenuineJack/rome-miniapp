# UserViewerContext

**Type**: type

User viewer context

Relationship status between the viewing user and this user.
Only present when `viewer_fid` parameter is provided.

**Properties:**

- `following: boolean` - Viewer follows this user
- `followed_by: boolean` - This user follows viewer
- `blocking: boolean` - Viewer blocks this user
- `blocked_by: boolean` - This user blocks viewer
