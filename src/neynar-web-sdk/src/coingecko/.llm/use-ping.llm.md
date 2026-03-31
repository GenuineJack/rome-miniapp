# usePing

**Type**: hook

Test CoinGecko API connectivity

Pings the CoinGecko API to verify service availability and connection status.
This endpoint is commonly used for health checks and debugging connectivity issues.
Returns a simple message indicating the API is responsive.

**API Endpoint:** `GET /ping`

## Import

```typescript
import { usePing } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function usePing(
  options?: ExtendedQueryOptions<PingResponse> & CoinGeckoHookOptions,
): QueryHookResult<PingResponse>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<PingResponse> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
QueryHookResult<PingResponse>;
```

TanStack Query result containing ping response data, loading state, and error info

## Usage

```typescript
import { usePing } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = usePing(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic connectivity test

```tsx
function APIHealthIndicator() {
  const { data: pingResult, isLoading, error } = usePing();

  if (isLoading) return <span>Checking API...</span>;
  if (error) return <span className="text-red-500">API Offline</span>;
  if (!pingResult) return <span>No response</span>;

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span>API Online: {pingResult.gecko_says}</span>
    </div>
  );
}
```

### Example 2

Automated health monitoring

```tsx
function useAPIHealthMonitor() {
  const { data, error, refetch } = usePing({
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    staleTime: 0, // Always check fresh
  });

  return {
    isHealthy: !!data?.gecko_says,
    hasError: !!error,
    lastCheck: data ? new Date() : null,
    recheckHealth: refetch,
  };
}
```

### Example 3

Error handling with fallback

```tsx
function APIStatus() {
  const { data, isLoading, error, refetch } = usePing();

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return <div>Testing API connection...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>API connection failed: {error.message}</p>
        <button onClick={handleRetry} className="mt-2">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="text-green-600">
      <p>✓ CoinGecko API is responsive</p>
      <p className="text-sm">Response: {data?.gecko_says}</p>
    </div>
  );
}
```
