# Notification

**Type**: type

Notification

A notification about activity related to the user.

**Core Properties:**

- `object: 'notification'` - Object type identifier
- `type:` {@link NotificationTypeEnum} - Type of notification (follows, likes, recasts, mention, reply)
- `most_recent_timestamp: string` - ISO timestamp of most recent activity
- `seen: boolean` - Whether notification has been seen

**Content (varies by type):**

- `follows?: Array<Follower>` - Follow notifications (when type is 'follows')
- `reactions?: Array<ReactionWithUserInfo>` - Reaction notifications (when type is 'likes' or 'recasts')
- `cast?:` {@link Cast} - Cast notifications (when type is 'mention', 'reply', or 'quote')

**Aggregation:**

- `count?: number` - Number of notifications bundled together
