# useAuthorizationUrl

**Type**: hook

Fetches authorized url useful for SIWN login operation

**Special Behaviors:**

- Extracts and returns just the URL string from the response object for convenience
- URL is stable and can be cached

## Import

```typescript
import { useAuthorizationUrl } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function useAuthorizationUrl(
  params: UseAuthorizationUrlParams,
  options?: QueryHookOptions<AuthorizationUrlResponse, string>,
): QueryHookResult<string>;
```

## Parameters

### params

- **Type**: `UseAuthorizationUrlParams`
- **Required**: Yes
- **Description**: Additional query parameters

**params properties:**

- `client_id: string` - Your application's client ID

This identifies your application to the Neynar API

- `response_type: "code"` - OAuth response type

Must be "code" for authorization code flow

### options

- **Type**: `QueryHookOptions<AuthorizationUrlResponse, string>`
- **Required**: No
- **Description**: - TanStack Query options for caching and request behavior

## Returns

```typescript
QueryHookResult<string>;
```

TanStack Query result with authorization URL

## Usage

```typescript
import { useAuthorizationUrl } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = useAuthorizationUrl(/* value */, "example");

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic authorization flow

```tsx
function LoginButton() {
  const { data: authUrl, isLoading } = useAuthorizationUrl({
    client_id: "your-client-id",
    response_type: "code",
  });

  if (isLoading) return <div>Generating auth URL...</div>;

  return (
    <a href={authUrl} target="_blank">
      Sign in with Farcaster
    </a>
  );
}
```
