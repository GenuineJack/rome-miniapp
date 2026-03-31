# useShare

Hook for sharing the mini app on Farcaster via cast composition.

**CRITICAL**: Uses `publicConfig.homeUrl` internally to ensure share URLs always point to the production domain (\*.neynar.app) rather than dev/preview URLs.

## Import

```typescript
import { useShare } from "@/neynar-farcaster-sdk/mini";
```

## Basic Usage

```typescript
const { share } = useShare();

// Basic share - opens cast composer with app link
await share({ text: "Check out this app!" });

// Share with custom path
await share({
  text: "I scored 1000 points!",
  path: "/leaderboard",
});
```

## Options

| Option          | Type    | Default                           | Description                          |
| --------------- | ------- | --------------------------------- | ------------------------------------ |
| text            | string  | `Check out ${publicConfig.name}!` | Text for the cast                    |
| path            | string  | undefined                         | URL path to append to app's home URL |
| additionalEmbed | string  | undefined                         | Additional embed URL (max 2 total)   |
| close           | boolean | false                             | Close mini app after sharing         |
| channelKey      | string  | undefined                         | Channel to post to                   |

## Return Value

```typescript
type ShareResult = {
  castHash: string | null; // Hash of created cast, or null if cancelled
};
```

## Examples

### Share Current Page

```typescript
function ShareCurrentPage() {
  const { share } = useShare();
  const pathname = usePathname();

  async function handleShare() {
    const result = await share({
      text: "Check out what I found!",
      path: pathname,
    });

    if (result.castHash) {
      console.log("Shared successfully:", result.castHash);
    }
  }

  return <button onClick={handleShare}>Share</button>;
}
```

### Share Game Score

```typescript
function ShareScore({ score }: { score: number }) {
  const { share } = useShare();

  async function handleShare() {
    await share({
      text: `I just scored ${score} points! Can you beat me?`,
      path: "/play",
    });
  }

  return <button onClick={handleShare}>Share Score</button>;
}
```

### Share to Channel

```typescript
const { share } = useShare();

await share({
  text: "New high score!",
  channelKey: "gaming",
});
```

## URL Construction

The share URL is automatically constructed using `publicConfig.homeUrl`:

- No path: `https://myapp.neynar.app`
- With path `/game/123`: `https://myapp.neynar.app/game/123`

**Never use `window.location.origin`** - it will embed dev/preview URLs instead of the production domain.

## Troubleshooting

### URL Not Appearing in Cast

If the share URL is not appearing in the cast, check:

1. **Local development**: Ensure `NEXT_PUBLIC_BASE_URL` is set in your `.env` file
2. **Vercel preview**: `VERCEL_URL` should be automatically set
3. **Vercel production**: `VERCEL_PROJECT_PRODUCTION_URL` should be automatically set

## Related

- `ShareButton` - Pre-built button component using this hook
- `publicConfig` - App configuration including homeUrl
