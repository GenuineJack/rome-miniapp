# useKeyInfo

**Type**: hook

Fetches comprehensive API key information including plan details and usage statistics

This hook provides essential information about your CoinGecko API key including:

- Current subscription plan and tier
- Monthly call credits and limits
- Current usage statistics and remaining calls
- Plan-specific features and rate limits

Essential for building usage monitoring dashboards, quota management systems,
and ensuring API compliance within your application's rate limits.

## Import

```typescript
import { useKeyInfo } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useKeyInfo(
  options?: ExtendedQueryOptions<KeyInfo> & CoinGeckoHookOptions,
): QueryHookResult<KeyInfo>;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<KeyInfo> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - TanStack Query options for caching and refetching behavior

## Returns

```typescript
QueryHookResult<KeyInfo>;
```

TanStack Query result with comprehensive API key information

## Usage

```typescript
import { useKeyInfo } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useKeyInfo(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

```typescript
const {
  data: keyInfo,
  isLoading,
  error,
} = useKeyInfo({
  staleTime: 300000, // Cache for 5 minutes
  refetchInterval: 300000, // Update every 5 minutes
});

// Monitor API usage:
if (keyInfo) {
  const usagePercentage =
    (keyInfo.current_total_monthly_calls / keyInfo.monthly_call_credit) * 100;
  const remainingCalls = keyInfo.current_remaining_monthly_calls;

  console.log(`Plan: ${keyInfo.plan}`);
  console.log(`Usage: ${usagePercentage.toFixed(1)}%`);
  console.log(`Remaining calls: ${remainingCalls}`);

  // Implement usage warnings:
  if (usagePercentage > 90) {
    showWarning("API quota nearly exceeded");
  }
}
```

### Example 2

```typescript
// Integration with rate limiting system:
const { data: keyInfo } = useKeyInfo({
  refetchInterval: 60000, // Check every minute
});

const canMakeRequest = keyInfo?.current_remaining_monthly_calls > 0;
const shouldThrottle =
  keyInfo &&
  keyInfo.current_remaining_monthly_calls / keyInfo.monthly_call_credit < 0.1;

if (!canMakeRequest) {
  throw new Error("Monthly API quota exceeded");
}

if (shouldThrottle) {
  // Implement request throttling logic
  await delay(1000);
}
```
