# MethodHandlers

**Type**: interface

Collection of route handlers grouped by HTTP method

## Type Definition

```typescript
import { MethodHandlers } from '@/neynar-web-sdk/nextjs';

interface MethodHandlers { ... }
```

## Interface Properties

### GET

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available

### POST

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available

### PUT

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available

### DELETE

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available

### PATCH

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available

### OPTIONS

- **Type**: `(
  request: NextRequest,
  context: { params: Promise<{ route: string[] }> },
) => Promise<Response>`
- **Required**: No
- **Description**: No description available
