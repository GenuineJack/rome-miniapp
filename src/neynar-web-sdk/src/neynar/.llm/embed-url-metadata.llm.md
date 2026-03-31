# EmbedUrlMetadata

**Type**: type

Embed URL metadata

Metadata extracted from an embedded URL.

**Properties:**

- `content_type?: string` - MIME type
- `content_length?: number` - Size in bytes
- `html?:` {@link HtmlMetadata} - HTML metadata (title, description, etc.)
- `image?:` {@link EmbedUrlMetadataImage} - Image metadata
- `video?:` {@link EmbedUrlMetadataVideo} - Video metadata
