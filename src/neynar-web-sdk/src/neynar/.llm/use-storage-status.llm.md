# useStorageStatus

**Type**: hook

Combined storage status hook

Provides a convenient way to get both storage allocations and usage data in a single hook.
Executes both queries in parallel for optimal performance. This is useful for dashboard
views where you need to show both capacity and current usage together.

## Import

```typescript
import { useStorageStatus } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useStorageStatus(
  params: UseStorageStatusParams,
  options?: QueryHookOptions<
    StorageAllocationsResponse | StorageUsageResponse,
    StorageAllocationsResponse | StorageUsageResponse
  >,
): UseQueryResult | UseMutationResult;
```

## Parameters

### params

- **Type**: `UseStorageStatusParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)

The FID of the user whose storage status to fetch

### options

- **Type**: `QueryHookOptions<
  StorageAllocationsResponse | StorageUsageResponse,
  StorageAllocationsResponse | StorageUsageResponse
  > `
- **Required**: No
- **Description**: - TanStack Query options applied to both queries

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

Object containing both allocation and usage query results

- `allocations` - Result from useStorageAllocations* - `usage` - Result from useStorageUsage* - `isLoading: boolean` - True if either query is loading
- `hasError: boolean` - True if either query has an error
- `refetchAll: () => void` - Function to refetch both queries

## Usage

```typescript
import { useStorageStatus } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useStorageStatus(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function StorageOverview({ fid }: { fid: number }) {
  const { allocations, usage, isLoading } = useStorageStatus({ fid });
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <p>Units: {allocations.data?.total_active_units || 0}</p>
      <p>
        Casts: {usage.data?.casts?.used || 0} /{" "}
        {usage.data?.casts?.capacity || 0}
      </p>
    </div>
  );
}
```
