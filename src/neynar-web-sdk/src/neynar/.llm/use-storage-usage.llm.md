# useStorageUsage

**Type**: hook

Fetches storage usage for a given user

Shows how much of the user's allocated storage capacity is currently being used
across casts, reactions, links, and other Farcaster actions. Use this to determine
when a user is approaching their storage limits and may need to purchase more.

## Import

```typescript
import { useStorageUsage } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useStorageUsage(
  params: UseStorageUsageParams,
  options?: QueryHookOptions<StorageUsageResponse, StorageUsageResponse>,
): QueryHookResult<StorageUsageResponse>;
```

## Parameters

### params

- **Type**: `UseStorageUsageParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)

The FID of the user whose storage usage to fetch

### options

- **Type**: `QueryHookOptions<StorageUsageResponse, StorageUsageResponse>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<StorageUsageResponse>;
```

TanStack Query result with storage usage data

- `data:` `StorageUsageResponse` with:
  Storage usage response

Response containing storage usage data.

- `object: 'storage_usage'` - Object type identifier
- `fid: number` - Farcaster ID
- `units: number` - Storage units used
- `timestamp: string` - ISO timestamp

## Usage

```typescript
import { useStorageUsage } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useStorageUsage(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function StorageUsageDisplay({ fid }: { fid: number }) {
  const { data, isLoading } = useStorageUsage({ fid });
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      Casts: {data?.casts?.used || 0} / {data?.casts?.capacity || 0}
    </div>
  );
}
```
