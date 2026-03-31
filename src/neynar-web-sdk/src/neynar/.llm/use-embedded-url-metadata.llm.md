# useEmbeddedUrlMetadata

**Type**: hook

Fetch embedded URL metadata

Crawls and retrieves metadata (title, description, images) for a URL to be embedded in a cast.
Useful for generating rich previews of links before posting.

## Import

```typescript
import { useEmbeddedUrlMetadata } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useEmbeddedUrlMetadata(
  url: string,
  options?: QueryHookOptions<CastEmbedCrawlResponse, CastEmbedCrawlResponse>,
): QueryHookResult<CastEmbedCrawlResponse>;
```

## Parameters

### url

- **Type**: `string`
- **Required**: Yes
- **Description**: - The URL to fetch metadata for

### options

- **Type**: `QueryHookOptions<CastEmbedCrawlResponse, CastEmbedCrawlResponse>`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
QueryHookResult<CastEmbedCrawlResponse>;
```

TanStack Query result containing URL metadata, loading state, and error info

- `data:` `CastEmbedCrawlResponse` with:
  Cast embed crawl response

Response from crawling an embedded URL.

- `url: string` - The crawled URL
- `metadata:` EmbedUrlMetadata - Metadata extracted from URL

**Referenced Types:**

**EmbedUrlMetadata:**
Embed URL metadata

Metadata extracted from an embedded URL.

- `content_type?: string` - MIME type
- `content_length?: number` - Size in bytes
- `html?:` HtmlMetadata - HTML metadata (title, description, etc.)
- `image?:` EmbedUrlMetadataImage - Image metadata
- `video?:` EmbedUrlMetadataVideo - Video metadata

## Usage

```typescript
import { useEmbeddedUrlMetadata } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useEmbeddedUrlMetadata("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Link preview generation

```tsx
function LinkPreview({ url }: { url: string }) {
  const { data: metadata, isLoading } = useEmbeddedUrlMetadata(url);

  if (isLoading) return <div>Loading preview...</div>;
  if (!metadata) return null;

  return (
    <div>
      {metadata.metadata.image && (
        <img
          src={metadata.metadata.image.url}
          alt={metadata.metadata.html?.title}
        />
      )}
      <h4>{metadata.metadata.html?.title || url}</h4>
      <p>{metadata.metadata.html?.description}</p>
      {metadata.metadata.html?.site_name && (
        <span>{metadata.metadata.html.site_name}</span>
      )}
    </div>
  );
}
```

Maps to: GET /casts/embedded-url-metadata
