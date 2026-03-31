# ExperimentalFarcasterIdInput

**Type**: component

ExperimentalFarcasterIdInput component

## JSX Usage

```jsx
import { ExperimentalFarcasterIdInput } from '@/neynar-web-sdk/neynar';

<ExperimentalFarcasterIdInput
  value="value"
  onChange={handleChange}
  onUserFound={handleUserFound}
  placeholder="Enter FID..."
  disabled=false
  className="value"
  id="value"
/>
```

## Component Props

### value

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### onChange

- **Type**: `(value: string) => void`
- **Required**: Yes
- **Description**: No description available

### onUserFound

- **Type**: `(user: User) => void`
- **Required**: No
- **Description**: No description available

### placeholder

- **Type**: `string`
- **Required**: No
- **Description**: No description available
- **Default**: "Enter FID..."

### disabled

- **Type**: `boolean`
- **Required**: No
- **Description**: No description available
- **Default**: false

### className

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### id

- **Type**: `string`
- **Required**: No
- **Description**: No description available
