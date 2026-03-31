# AppHostGetEventResponse

**Type**: type

App host event response

Response from fetching app host event data.

**Properties:**

- `event: string` - Legacy event type string corresponding to the requested event type
- `notificationDetails?:` {@link AppHostGetEventResponseNotificationDetails} - Notification setup details (only present when event is notifications_enabled)
