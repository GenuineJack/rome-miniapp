# ShareButton

A button component for sharing the mini app on Farcaster.

**CRITICAL**: Uses `publicConfig.homeUrl` internally to ensure share URLs always point to the production domain (\*.neynar.app) rather than dev/preview URLs.

## Import

```typescript
import { ShareButton } from "@/neynar-farcaster-sdk/mini";
```

## Basic Usage

```tsx
// Simple share button
<ShareButton text="Check out this app!" />

// Share with custom button text
<ShareButton text="I scored 1000 points!">
  Share Score
</ShareButton>

// Share specific page
<ShareButton text="Check this out!" path="/game/123">
  Share Game
</ShareButton>
```

## Props

| Prop            | Type                                             | Default                           | Description                    |
| --------------- | ------------------------------------------------ | --------------------------------- | ------------------------------ |
| children        | ReactNode                                        | "Share"                           | Button text                    |
| text            | string                                           | `Check out ${publicConfig.name}!` | Cast text                      |
| path            | string                                           | undefined                         | URL path to append to home URL |
| additionalEmbed | string                                           | undefined                         | Additional embed URL           |
| channelKey      | string                                           | undefined                         | Channel to post to             |
| variant         | "default" \| "secondary" \| "outline" \| "ghost" | "secondary"                       | Button style variant           |
| size            | "default" \| "sm" \| "lg" \| "icon"              | "default"                         | Button size                    |
| className       | string                                           | undefined                         | Additional CSS classes         |
| disabled        | boolean                                          | false                             | Disable the button             |
| onSuccess       | (castHash: string) => void                       | undefined                         | Callback on successful share   |
| onCancel        | () => void                                       | undefined                         | Callback if user cancels       |

## Examples

### Basic Share

```tsx
<ShareButton text="Check out this mini app!" />
```

### Share with Callbacks

```tsx
<ShareButton
  text="I just got a high score!"
  path="/leaderboard"
  onSuccess={(hash) => {
    console.log("Cast created:", hash);
    showToast("Shared successfully!");
  }}
  onCancel={() => {
    console.log("User cancelled");
  }}
>
  Share My Score
</ShareButton>
```

### Styled Share Button

```tsx
<ShareButton
  text="Join me in this game!"
  variant="default"
  size="lg"
  className="mt-4"
>
  Invite Friends
</ShareButton>
```

### Share to Channel

```tsx
<ShareButton text="New achievement unlocked!" channelKey="gaming">
  Share to /gaming
</ShareButton>
```

### Conditional Share

```tsx
function GameOver({ score }: { score: number }) {
  return (
    <div>
      <h2>Game Over! Score: {score}</h2>
      <ShareButton
        text={`I scored ${score} points! Can you beat me?`}
        path="/play"
        disabled={score === 0}
      >
        {score > 100 ? "Brag About It!" : "Share Score"}
      </ShareButton>
    </div>
  );
}
```

## How It Works

1. User clicks the button
2. Button shows "Sharing..." state
3. Opens Farcaster cast composer with:
   - The provided text
   - The app's production URL (with optional path) as an embed
4. User posts or cancels the cast
5. Appropriate callback fires

## URL Construction

Share URLs are automatically constructed using `publicConfig.homeUrl`:

- No path: `https://myapp.neynar.app`
- With path `/game/123`: `https://myapp.neynar.app/game/123`

**This ensures shares always link to the production app**, not dev/preview URLs.

## Related

- `useShare` - Hook for custom share implementations
- `publicConfig` - App configuration including homeUrl
