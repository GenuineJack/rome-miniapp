# useAppHostUserState

**Type**: hook

Returns the current notification state for a specific user across all mini app domains in this app host

Fetches which mini app domains have notifications enabled for the user. Essential for building
notification management interfaces and conditional notification flows in multi-domain apps.
Shows complete notification status including domain, validity, and last update timestamp.

## Import

```typescript
import { useAppHostUserState } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useAppHostUserState(
  params: UseAppHostUserStateParams,
  options?: QueryHookOptions<
    AppHostUserStateResponse,
    AppHostUserStateResponse
  >,
): QueryHookResult<AppHostUserStateResponse>;
```

## Parameters

### params

- **Type**: `UseAppHostUserStateParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - - The FID of the user whose notification preferences to fetch

### options

- **Type**: `QueryHookOptions<
  AppHostUserStateResponse,
  AppHostUserStateResponse
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<AppHostUserStateResponse>;
```

TanStack Query result with user state data

- `data:` `AppHostUserStateResponse` with:
  App host user state response

Response containing user's app host state and notification preferences.

- `notifications_enabled: Array<AppHostUserStateResponseNotificationsEnabledInner>` - List of domains for which notifications are enabled for this user

## Usage

```typescript
import { useAppHostUserState } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useAppHostUserState(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic user notification state display

```tsx
function UserNotificationStatus({ fid }: { fid: number }) {
  const { data: userState, isLoading, error } = useAppHostUserState({ fid });

  if (isLoading) return <div>Loading notification status...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!userState?.notifications_enabled?.length) {
    return <div>No notifications enabled</div>;
  }

  return (
    <div>
      <h3>Notifications Enabled For:</h3>
      <ul>
        {userState.notifications_enabled.map((notif) => (
          <li key={notif.domain}>
            <strong>{notif.domain}</strong>
            {notif.enabled_at && (
              <span>
                {" "}
                - Enabled: {new Date(notif.enabled_at).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 2

Check if notifications enabled for specific domain

```tsx
function DomainNotificationToggle({
  fid,
  domain,
}: {
  fid: number;
  domain: string;
}) {
  const { data: userState } = useAppHostUserState({ fid });

  const isEnabled = userState?.notifications_enabled?.some(
    (notif) => notif.domain === domain,
  );

  return (
    <div>
      <h4>Notifications for {domain}</h4>
      <p>Status: {isEnabled ? "Enabled" : "Disabled"}</p>
      {isEnabled && <span>You will receive notifications from this app</span>}
    </div>
  );
}
```
