# NeynarUser

**Type**: type

Neynar API types for general web applications Only includes types that are actually used by client components

## Type Definition

```typescript
import { NeynarUser } from "@/neynar-web-sdk";

type NeynarUser = {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  profile?: {
    bio?: {
      text?: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications?: string[];
  verified_addresses?: {
    eth_addresses?: string[];
    sol_addresses?: string[];
  };
  custody_address?: string;
  external_id?: string;
  object?: string;
};
```

## Type Properties

### fid

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### username

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### display_name

- **Type**: `string`
- **Required**: Yes
- **Description**: No description available

### pfp_url

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### profile

- **Type**: `{
  bio?: {
    text?: string;
  };
}`
- **Required**: No
- **Description**: No description available

### follower_count

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### following_count

- **Type**: `number`
- **Required**: Yes
- **Description**: No description available

### verifications

- **Type**: `string[]`
- **Required**: No
- **Description**: No description available

### verified_addresses

- **Type**: `{
  eth_addresses?: string[];
  sol_addresses?: string[];
}`
- **Required**: No
- **Description**: No description available

### custody_address

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### external_id

- **Type**: `string`
- **Required**: No
- **Description**: No description available

### object

- **Type**: `string`
- **Required**: No
- **Description**: No description available
