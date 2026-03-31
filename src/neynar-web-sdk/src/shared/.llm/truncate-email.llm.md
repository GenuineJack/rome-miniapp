# truncateEmail

**Type**: function

Truncate email address if it's too long

## API Surface

```typescript
import { truncateEmail } from '@/neynar-web-sdk';

export function truncateEmail(email: string, maxLength?: number = 20): string { ... }
```

## Parameters

### email

- **Type**: `string`
- **Required**: Yes
- **Description**: The email to truncate

### maxLength

- **Type**: `number`
- **Required**: No
- **Description**: Maximum length before truncation (default: 20)
- **Default**: 20

## Returns

- **Type**: `string`
- **Description**: Truncated email with ellipsis
