# useFrameMetaTags

**Type**: hook

Fetch frame meta tags from URL

Extracts frame meta tags from a given URL to determine if it contains a valid
frame and retrieve its metadata. This is useful for frame validation, previews,
and ensuring proper frame configuration.

## Import

```typescript
import { useFrameMetaTags } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFrameMetaTags(
  url: string,
  options?: QueryHookOptions<FetchFrameMetaTagsFromUrl200Response, Frame>,
): QueryHookResult<Frame>;
```

## Parameters

### url

- **Type**: `string`
- **Required**: Yes
- **Description**: - The URL to extract frame meta tags from

### options

- **Type**: `QueryHookOptions<FetchFrameMetaTagsFromUrl200Response, Frame>`
- **Required**: No
- **Description**: - Optional query configuration options

## Returns

```typescript
QueryHookResult<Frame>;
```

TanStack Query result containing frame metadata

- `data:` `Frame` with:
  Frame

Interactive frame embedded in a cast.

- `version: string` - Frame version
- `title?: string` - Frame title
- `image: string` - Frame image URL
- `buttons?: Array<FrameButton>` - Interactive buttons
- `input?: FrameInput` - Input field configuration
- `state?: FrameState` - Frame state data
- `post_url?: string` - URL for frame actions
- `frames_url?: string` - URL for frame manifest

## Usage

```typescript
import { useFrameMetaTags } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFrameMetaTags("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Frame meta tags extraction

```tsx
const { data: frameMetaTags, isLoading } = useFrameMetaTags(
  "https://example.com/frame",
  {
    onSuccess: (metaTags) => {
      console.log("Frame title:", metaTags.title);
      console.log("Frame image:", metaTags.image);
    },
  },
);

if (isLoading) return <div>Loading frame...</div>;

return (
  <div>
    <h2>{frameMetaTags?.title}</h2>
    <img src={frameMetaTags?.image} alt="Frame" />
  </div>
);
```
