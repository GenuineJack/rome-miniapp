# usePublishFrameNotifications

**Type**: hook

Publish frame notifications

Sends push notifications to users who have enabled notifications for your app. Notifications are delivered via the Farcaster mobile app.

**IMPORTANT**: Notifications are automatically enabled for all apps. No configuration needed - just use this hook.

## When to Use

Use this hook for **programmatic notifications** triggered by app logic:

- Notify a user when they receive a reply or mention
- Alert users when a game ends or they achieve something
- Send personalized notifications to specific users

**For batch/marketing notifications** (announcements to all users), use the Neynar Developer Portal at dev.neynar.com/apps instead.

## Import

```typescript
import { usePublishFrameNotifications } from "@/neynar-web-sdk/neynar";
import { publicConfig } from "@/config/public-config";
```

## Hook Signature

```typescript
function usePublishFrameNotifications(
  options?: ExtendedMutationOptions<
    SendFrameNotificationsResponse,
    UsePublishFrameNotificationsParams
  >,
): MutationHookResult<
  SendFrameNotificationsResponse,
  UsePublishFrameNotificationsParams
>;
```

## Parameters

### Mutation Parameters

When calling `mutate()`, provide:

- `frame_url` (string, required) - Your app's URL. Use `publicConfig.homeUrl`
- `title` (string, required) - Notification title (keep short)
- `message` (string, required) - Notification body text
- `target_fids` (number[], optional) - Specific user FIDs to notify. If omitted, notifies all subscribers

### Hook Options

- `onSuccess` - Called when notifications are sent successfully
- `onError` - Called if sending fails

## Returns

```typescript
MutationHookResult<
  SendFrameNotificationsResponse,
  UsePublishFrameNotificationsParams
>;
```

TanStack Query mutation result with `mutate` function and state (`isPending`, `isSuccess`, `isError`)

## Examples

### Notify Specific Users

```tsx
import { usePublishFrameNotifications } from "@/neynar-web-sdk/neynar";
import { publicConfig } from "@/config/public-config";

function NotifyWinnerButton({ winnerFid }: { winnerFid: number }) {
  const { mutate, isPending } = usePublishFrameNotifications({
    onSuccess: () => console.log("Winner notified!"),
    onError: (error) => console.error("Failed:", error),
  });

  const notifyWinner = () => {
    mutate({
      frame_url: publicConfig.homeUrl,
      title: "🎉 You Won!",
      message: "Congratulations! Check out your prize.",
      target_fids: [winnerFid],
    });
  };

  return (
    <button onClick={notifyWinner} disabled={isPending}>
      {isPending ? "Sending..." : "Notify Winner"}
    </button>
  );
}
```

### Notify on Game End

```tsx
import { usePublishFrameNotifications } from "@/neynar-web-sdk/neynar";
import { publicConfig } from "@/config/public-config";

function useGameEndNotification() {
  const { mutate } = usePublishFrameNotifications();

  const notifyGameEnd = (playerFid: number, score: number) => {
    mutate({
      frame_url: publicConfig.homeUrl,
      title: "Game Over!",
      message: `You scored ${score} points. Can you beat your high score?`,
      target_fids: [playerFid],
    });
  };

  return { notifyGameEnd };
}
```

### Broadcast to All Subscribers

```tsx
import { usePublishFrameNotifications } from "@/neynar-web-sdk/neynar";
import { publicConfig } from "@/config/public-config";

// Only use for important app-wide announcements
// For marketing, use dev.neynar.com/apps instead
function AnnouncementButton() {
  const { mutate, isPending } = usePublishFrameNotifications();

  const broadcastAnnouncement = () => {
    mutate({
      frame_url: publicConfig.homeUrl,
      title: "New Feature!",
      message: "We just added leaderboards. Check it out!",
      // No target_fids = broadcast to all subscribers
    });
  };

  return (
    <button onClick={broadcastAnnouncement} disabled={isPending}>
      Announce
    </button>
  );
}
```

## Best Practices

1. **Always use `publicConfig.homeUrl`** for the `frame_url` - never hardcode URLs
2. **Keep titles short** - they appear in push notification headers
3. **Be specific with `target_fids`** - don't spam all users for individual events
4. **Use batch notifications sparingly** - for major announcements only

## See Also

- [Neynar Notifications API](https://docs.neynar.com/reference/publish-frame-notifications)
- For batch notifications: Use the [Neynar Developer Portal](https://dev.neynar.com/apps)
