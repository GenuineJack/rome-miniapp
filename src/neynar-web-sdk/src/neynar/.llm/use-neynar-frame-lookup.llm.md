# useNeynarFrameLookup

**Type**: hook

Lookup Neynar frame

Looks up a specific frame in the Neynar frame registry by UUID or URL.
Returns detailed frame information including metadata, status, and configuration.

## Import

```typescript
import { useNeynarFrameLookup } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNeynarFrameLookup(
  params: UseNeynarFrameLookupParams,
  options?: QueryHookOptions<NeynarFrame, NeynarFrame>,
): QueryHookResult<NeynarFrame>;
```

## Parameters

### params

- **Type**: `UseNeynarFrameLookupParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `type: 'uuid' | 'url'` - Type of identifier to use for lookup
- `uuid?: string` - UUID of the frame (required when type='uuid')
- `url?: string` - URL of the frame (required when type='url')

### options

- **Type**: `QueryHookOptions<NeynarFrame, NeynarFrame>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<NeynarFrame>;
```

TanStack Query result with frame data

- `data:` `NeynarFrame` with:
  Neynar frame

A Neynar-hosted mini app (frame) with multiple pages.

- `uuid: string` - Unique identifier for the mini app
- `name: string` - Name of the mini app
- `link: string` - Generated link for the mini app's first page
- `pages: Array<NeynarFramePage>` - Pages in the mini app
- `valid?: boolean` - Indicates if the mini app is valid

## Usage

```typescript
import { useNeynarFrameLookup } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useNeynarFrameLookup(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Frame lookup by UUID

```tsx
const { data: frame, isLoading } = useNeynarFrameLookup({
  type: "uuid",
  uuid: "my-frame-uuid",
});
```

### Example 2

Frame lookup by URL

```tsx
const { data: frameByUrl } = useNeynarFrameLookup({
  type: "url",
  url: "https://example.com/frame",
});
```
