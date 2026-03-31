# NeynarFrame

**Type**: type

Neynar frame

A Neynar-hosted mini app (frame) with multiple pages.

**Properties:**

- `uuid: string` - Unique identifier for the mini app
- `name: string` - Name of the mini app
- `link: string` - Generated link for the mini app's first page
- `pages: Array<NeynarFramePage>` - Pages in the mini app
- `valid?: boolean` - Indicates if the mini app is valid

**Usage Context:**

- Returned when creating or fetching Neynar-hosted frames
- Used for managing multi-page interactive mini apps
