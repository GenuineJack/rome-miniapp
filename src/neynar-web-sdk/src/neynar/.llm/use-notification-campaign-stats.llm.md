# useNotificationCampaignStats

**Type**: hook

Retrieve notification delivery and opened stats for notification campaigns

Fetches delivery and engagement statistics for notification campaigns. Can retrieve
stats for a specific campaign or all campaigns. Useful for tracking notification
campaign performance and user engagement metrics.

## Import

```typescript
import { useNotificationCampaignStats } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useNotificationCampaignStats(
  campaignId?: string,
  params?: UseNotificationCampaignStatsParams,
  options?: ExtendedQueryOptions<unknown>,
): UseQueryResult | UseMutationResult;
```

## Parameters

### campaignId

- **Type**: `string`
- **Required**: No
- **Description**: - An ID of a specific notification campaign to query (optional - if omitted, returns stats for all campaigns)

### params

- **Type**: `UseNotificationCampaignStatsParams`
- **Required**: No
- **Description**: Additional query parameters

**params properties:**

- `limit?: number` - The number of results to return (default: 100, max: 1000)
- `cursor?: string` - Pagination cursor

### options

- **Type**: `ExtendedQueryOptions<unknown>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query result with campaign statistics

## Usage

```typescript
import { useNotificationCampaignStats } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useNotificationCampaignStats("example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function CampaignStats({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useNotificationCampaignStats(campaignId);
  if (isLoading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```
