# useAppHostEvent

**Type**: hook

Returns event object for app host events

Used if the app host intends to sign the event message instead of using Neynar-hosted signers.
This hook generates the event data structure needed to communicate app lifecycle changes
(frame installation/removal, notification preferences) when using custom signing instead of
Neynar's managed signers.

**Special Behaviors:**

- `notificationDetails` only present in response when event is `'notifications_enabled'`

## Import

```typescript
import { useAppHostEvent } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useAppHostEvent(
  params: UseAppHostEventParams,
  options?: QueryHookOptions<AppHostGetEventResponse, AppHostGetEventResponse>,
): QueryHookResult<AppHostGetEventResponse>;
```

## Parameters

### params

- **Type**: `UseAppHostEventParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `appDomain: string` - - The domain of the mini app
- `fid: number` - - The FID of the user who initiated the event
- `event: | "frame_added"
| "frame_removed"
| "notifications_enabled"
| "notifications_disabled"` - - The type of event

### options

- **Type**: `QueryHookOptions<AppHostGetEventResponse, AppHostGetEventResponse>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<AppHostGetEventResponse>;
```

TanStack Query result with app host event data

- `data:` `AppHostGetEventResponse` with:
  App host event response

Response from fetching app host event data.

- `event: string` - Legacy event type string corresponding to the requested event type
- `notificationDetails?:` AppHostGetEventResponseNotificationDetails - Notification setup details (only present when event is notifications_enabled)

**Referenced Types:**

**AppHostGetEventResponseNotificationDetails:**
App host notification details

Details for notification setup, only present when event is notifications_enabled.

- `url: string` - URL endpoint for sending notifications
- `token: string` - Token to use when sending notifications to this user

## Usage

```typescript
import { useAppHostEvent } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useAppHostEvent(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic usage

```tsx
function FrameInstallTracker({
  appDomain,
  userFid,
}: {
  appDomain: string;
  userFid: number;
}) {
  const { data: eventData, isLoading } = useAppHostEvent({
    appDomain,
    fid: userFid,
    event: "frame_added",
  });
  if (isLoading) return <div>Generating event...</div>;
  return <div>Event Type: {eventData?.event}</div>;
}
```
