# usePublishCast

**Type**: hook

Publish a new cast

Creates and publishes a new cast to Farcaster. Supports text, embeds, channel posting,
and replies. Automatically invalidates relevant feeds and conversations on success.

## Import

```typescript
import { usePublishCast } from "@/neynar-web-sdk/neynar";
```

## Hook Signature

```typescript
function usePublishCast(
  options?: ExtendedMutationOptions<PostCastResponse, PublishCastParams>,
): MutationHookResult<PostCastResponse, PublishCastParams>;
```

## Parameters

### options

- **Type**: `ExtendedMutationOptions<PostCastResponse, PublishCastParams>`
- **Required**: No
- **Description**: - Additional mutation options
- `onSuccess?: (data, variables) => void` - Called after successful publish
- `onError?: (error) => void` - Called on error
- `onMutate?: (variables) => void` - Called before mutation starts

## Returns

```typescript
MutationHookResult<PostCastResponse, PublishCastParams>;
```

TanStack Query mutation result

- `mutate: (params: PublishCastParams) => void` - Trigger cast publish
- `isPending: boolean` - True while publishing
- `isError: boolean` - True if publish failed
- `error: ApiError | null` - Error if failed
- `isSuccess: boolean` - True if publish succeeded
  \*Mutation Parameters:\*\*

```typescript
{
signer_uuid: string;            // Signer UUID for authentication
text: string;                   // Cast content (max 320 characters)
embeds?: Array<{                // Optional embeds
url?: string;                 // URL to embed
cast_id?: {                   // Quote cast
fid: number;
hash: string;
};
}>;
channel_id?: string;            // Optional channel to post in
reply_to?: string;              // Hash of cast to reply to
parent?: string;                // Parent cast hash for threading
}
```

## Usage

```typescript
import { usePublishCast } from '@/neynar-web-sdk/neynar';

function MyComponent() {
  const result = usePublishCast(/* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

Basic cast publishing

```tsx
function ComposeC ast({ signerUuid }: { signerUuid: string }) {
const [text, setText] = useState('');
const publishMutation = usePublishCast({
onSuccess: (data) => {
console.log('Published cast:', data.cast.hash);
setText('');
},
onError: (error) => alert('Failed to publish: ' + error.message)
});

return (
<div>
<textarea
value={text}
onChange={(e) => setText(e.target.value)}
maxLength={320}
placeholder="What's happening?"
/>
<button
onClick={() => publishMutation.mutate({
 signer_uuid: signerUuid,
 text
})}
disabled={!text.trim() || publishMutation.isPending}
>
{publishMutation.isPending ? 'Publishing...' : 'Cast'}
</button>
</div>
);
}
```

Maps to: POST /casts
