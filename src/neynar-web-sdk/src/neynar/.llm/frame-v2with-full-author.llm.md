# FrameV2WithFullAuthor

**Type**: type

Mini app v2 object with full user object

Frame v2 (mini app) with complete author information.

**Properties:**

- `version: string` - Version of the mini app ('next' for v2, 'vNext' for v1)
- `image: string` - URL of the frame image
- `frames_url: string` - Launch URL of the mini app
- `title?: string` - Button title of the mini app
- `manifest?:` {@link FarcasterManifest} - Farcaster manifest object
- `author?:` {@link User} - Full user object of the frame author
- `metadata?: FetchRelevantFrames200ResponseRelevantFramesInnerFrameMetadata` - Frame metadata
