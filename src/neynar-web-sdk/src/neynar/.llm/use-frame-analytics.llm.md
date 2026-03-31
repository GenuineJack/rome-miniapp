# useFrameAnalytics

**Type**: hook

Fetch frame analytics

Retrieves comprehensive analytics data for frames, including interaction counts,
performance metrics, usage statistics, and time-series data.

## Import

```typescript
import { useFrameAnalytics } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFrameAnalytics(
  params: FrameAnalyticsParams,
  options?: QueryHookOptions<
    FrameValidateAnalyticsResponse,
    FrameValidateAnalyticsResponse
  >,
): QueryHookResult<FrameValidateAnalyticsResponse>;
```

## Parameters

### params

- **Type**: `FrameAnalyticsParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `frame_url: string` - URL of the frame to fetch analytics for (required)
- `analytics_type: 'total-interactors' | 'interactors' | 'interactions-per-cast' | 'input-text'` - Type of analytics (required). Valid values: 'total-interactors', 'interactors', 'interactions-per-cast', 'input-text'
- `start: string` - Start timestamp in ISO 8601 format (required)
- `stop: string` - Stop timestamp in ISO 8601 format (required)
- `aggregate_window?: '10s' | '1m' | '2m' | '5m' | '10m' | '20m' | '30m' | '2h' | '12h' | '1d' | '7d'` - Time window for aggregation (required for analytics_type=interactions-per-cast). Valid values: '10s', '1m', '2m', '5m', '10m', '20m', '30m', '2h', '12h', '1d', '7d'

### options

- **Type**: `QueryHookOptions<
  FrameValidateAnalyticsResponse,
  FrameValidateAnalyticsResponse
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<FrameValidateAnalyticsResponse>;
```

TanStack Query result with frame analytics data

- `data:` `FrameValidateAnalyticsResponse` with:
  Frame validate analytics response

Response containing frame analytics data.

- `total_interactions: number` - Total number of interactions
- `unique_interactors: number` - Number of unique users
- `interactions_per_cast:` FrameValidateAnalyticsInteractionsPerCast - Breakdown by cast

**Referenced Types:**

## Usage

```typescript
import { useFrameAnalytics } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFrameAnalytics(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic analytics query

```tsx
const { data: analytics, isLoading } = useFrameAnalytics({
  frame_url: "https://example.com/frame",
  analytics_type: "total-interactors",
  start: "2024-01-01T00:00:00Z",
  stop: "2024-01-31T23:59:59Z",
});
```

### Example 2

Interactions per cast with aggregation

```tsx
const { data: analytics } = useFrameAnalytics({
  frame_url: "https://example.com/frame",
  analytics_type: "interactions-per-cast",
  start: "2024-01-01T00:00:00Z",
  stop: "2024-01-31T23:59:59Z",
  aggregate_window: "1d",
});
```
