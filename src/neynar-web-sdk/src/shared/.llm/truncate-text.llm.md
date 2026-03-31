# truncateText

**Type**: function

Truncate any text to a maximum length

## API Surface

```typescript
import { truncateText } from '@/neynar-web-sdk';

export function truncateText(text: string, maxLength: number): string { ... }
```

## Parameters

### text

- **Type**: `string`
- **Required**: Yes
- **Description**: The text to truncate

### maxLength

- **Type**: `number`
- **Required**: Yes
- **Description**: Maximum length before truncation

## Returns

- **Type**: `string`
- **Description**: Truncated text with ellipsis
