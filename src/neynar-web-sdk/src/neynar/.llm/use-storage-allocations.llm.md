# useStorageAllocations

**Type**: hook

Fetches storage allocations for a given user

Shows how much storage capacity a user has purchased and when it expires.
Each storage unit provides capacity for 5000 casts, 2500 reactions, and 2500 links.

## Import

```typescript
import { useStorageAllocations } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useStorageAllocations(
  params: UseStorageAllocationsParams,
  options?: QueryHookOptions<
    StorageAllocationsResponse,
    StorageAllocationsResponse
  >,
): QueryHookResult<StorageAllocationsResponse>;
```

## Parameters

### params

- **Type**: `UseStorageAllocationsParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `fid: number` - The unique identifier of a farcaster user or app (unsigned integer)

The FID of the user whose storage allocations to fetch

### options

- **Type**: `QueryHookOptions<
  StorageAllocationsResponse,
  StorageAllocationsResponse
  > `
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<StorageAllocationsResponse>;
```

TanStack Query result with storage allocation data

- `data:` `StorageAllocationsResponse` with:
  Storage allocations response

Response containing storage allocation data.

- `allocations: Array<StorageAllocation>` - Array of storage allocations
- `total_active_units: number` - Total active storage units

## Usage

```typescript
import { useStorageAllocations } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useStorageAllocations(/* value */, /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function StorageAllocationDisplay({ fid }: { fid: number }) {
  const { data, isLoading } = useStorageAllocations({ fid });
  if (isLoading) return <div>Loading...</div>;
  return <div>Active Units: {data?.total_active_units || 0}</div>;
}
```
