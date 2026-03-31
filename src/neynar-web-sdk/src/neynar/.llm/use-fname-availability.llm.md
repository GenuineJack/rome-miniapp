# useFnameAvailability

**Type**: hook

Check if a given fname is available

Validates whether a Farcaster name (fname) is available for registration.
Useful for username availability checks during user onboarding or profile updates.

**Special Behaviors:**

- Query auto-disabled when fname is empty or whitespace-only
- Returns boolean directly (extracts `available` field from response)

## Import

```typescript
import { useFnameAvailability } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useFnameAvailability(
  fname: string,
  options?: QueryHookOptions<FnameAvailabilityResponse, boolean>,
): QueryHookResult<boolean>;
```

## Parameters

### fname

- **Type**: `string`
- **Required**: Yes
- **Description**: - The Farcaster name to check availability for

### options

- **Type**: `QueryHookOptions<FnameAvailabilityResponse, boolean>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<boolean>;
```

TanStack Query result with fname availability

## Usage

```typescript
import { useFnameAvailability } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useFnameAvailability("example", true);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function FnameChecker() {
  const [username, setUsername] = useState("");
  const { data: isAvailable, isLoading } = useFnameAvailability(username);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter fname"
      />
      {isLoading && <span>Checking...</span>}
      {isAvailable !== undefined && (
        <span>{isAvailable ? "Available" : "Taken"}</span>
      )}
    </div>
  );
}
```
