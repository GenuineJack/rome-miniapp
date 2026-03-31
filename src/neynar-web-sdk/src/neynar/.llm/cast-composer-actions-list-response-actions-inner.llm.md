# CastComposerActionsListResponseActionsInner

**Type**: type

Cast composer actions list response actions inner

An individual composer action available to users.

**Properties:**

- `name?: string` - The name of the action
- `icon?: string` - The icon representing the action
- `description?: string` - A brief description of the action
- `about_url?: string` - URL to learn more about the action
- `image_url?: string` - URL of the action's image
- `action_url?: string` - URL to perform the action
- `action?:` {@link CastComposerActionsListResponseActionsInnerAction} - Action configuration details
- `octicon?: string` - Icon name for the action
- `added_count?: number` - Number of times the action has been added
- `app_name?: string` - Name of the application providing the action
- `author_fid?: number` - Author's Farcaster ID
- `category?: string` - Category of the action
- `object?: string` - Object type, which is "composer_action"

**Usage Context:**

- Returned by {@link CastComposerActionsListResponse}
- Used to display available composer actions in the UI
