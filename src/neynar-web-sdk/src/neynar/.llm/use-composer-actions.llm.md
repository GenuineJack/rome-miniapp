# useComposerActions

**Type**: hook

Retrieves available Farcaster composer actions

**Special Behaviors:**

- Limit: Default 25, Maximum 25
- `list` parameter is required ('top' or 'featured')

## Import

```typescript
import { useComposerActions } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useComposerActions(
  params: UseComposerActionsParams,
  options?: QueryHookOptions<
    CastComposerActionsListResponse,
    CastComposerActionsListResponseActionsInner[]
  >,
): QueryHookResult<CastComposerActionsListResponseActionsInner[]>;
```

## Parameters

### params

- **Type**: `UseComposerActionsParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `list: "top" | "featured"` - Type of list to fetch (REQUIRED)
- `limit?: number` - Number of results to fetch (default: 25, max: 25)
- `cursor?: string` - Cursor for pagination

### options

- **Type**: `QueryHookOptions<
  CastComposerActionsListResponse,
  CastComposerActionsListResponseActionsInner[]
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<CastComposerActionsListResponseActionsInner[]>;
```

TanStack Query result with composer actions data

- `data:` `CastComposerActionsListResponseActionsInner` with:
  Cast composer actions list response actions inner

An individual composer action available to users.

- `name?: string` - The name of the action
- `icon?: string` - The icon representing the action
- `description?: string` - A brief description of the action
- `about_url?: string` - URL to learn more about the action
- `image_url?: string` - URL of the action's image
- `action_url?: string` - URL to perform the action
- `action?:` CastComposerActionsListResponseActionsInnerAction - Action configuration details
- `octicon?: string` - Icon name for the action
- `added_count?: number` - Number of times the action has been added
- `app_name?: string` - Name of the application providing the action
- `author_fid?: number` - Author's Farcaster ID
- `category?: string` - Category of the action
- `object?: string` - Object type, which is "composer_action"

**Referenced Types:**

**CastComposerActionsListResponse:**
Cast composer actions list response

Response containing available composer actions.

- `actions: Array<CastComposerActionsListResponseActionsInner>` - Available actions

## Usage

```typescript
import { useComposerActions } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useComposerActions(/* value */, []);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function ComposerActions() {
  const { data: actions, isLoading } = useComposerActions({
    list: "featured",
  });

  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      {actions?.map((a) => (
        <div key={a.name}>{a.name}</div>
      ))}
    </div>
  );
}
```

Maps to: GET /casts/composer-actions
