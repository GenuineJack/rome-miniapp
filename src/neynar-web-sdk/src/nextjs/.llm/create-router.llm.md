# createRouter

**Type**: function

Creates HTTP route handlers for API endpoints

This is the main factory function that creates Next.js API route handlers.
It takes a map of routes (already bound to their dependencies) and returns
handlers for each HTTP method that can be used directly in Next.js API routes.

HOW IT WORKS:

1. You define routes in a RouteMap (e.g., "GET /users" -> handler function)
2. This factory creates HTTP method handlers (GET, POST, etc.)
3. When a request comes in, it matches the route and calls your handler
4. Your handler receives request parameters and returns the result
5. The response is normalized and returned with proper CORS headers

## API Surface

```typescript
import { createRouter } from '@/neynar-web-sdk/nextjs';

export function createRouter({
  routes,
  headers,
}: {
  routes: RouteMap;
  headers: Record<string, string>;
}): MethodHandlers { ... }
```

## Parameters

### {

routes,
headers,
}

- **Type**: `{
  routes: RouteMap;
  headers: Record<string, string>;
}`
- **Required**: Yes
- **Description**: No description available

## Returns

- **Type**: `MethodHandlers`
- **Description**: Object with HTTP method handlers (GET, POST, PUT, DELETE, etc.) ready for Next.js

## Examples

```typescript
// In your Next.js API route file: /api/myservice/[...route]/route.ts
const routes = {
  "GET /users/bulk": async (params) => someClient.fetchBulkUsers(params.query),
};
export const { GET, POST, PUT, DELETE } = createRouter({
  routes,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "public, max-age=60",
  },
});
```
