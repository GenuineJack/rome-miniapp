# ParticleEmitter

**Type**: component

Particle emitter component

Renders particles from useParticles hook.
Each particle is rendered as a colored circle that moves and fades out.

## JSX Usage

```jsx
import { ParticleEmitter } from "@/neynar-farcaster-sdk/game";

<ParticleEmitter particles={[]} className="" />;
```

## Component Props

### particles

- **Type**: `Particle[]`
- **Required**: Yes
- **Description**: Array of particles to render

### className

- **Type**: `string`
- **Required**: No
- **Description**: Additional CSS classes
- **Default**: ""

## Examples

const { particles, emit } = useParticles();
return (

  <div className="relative">
    <ParticleEmitter particles={particles} />
    <button onClick={() => emit({ x: 100, y: 100 })}>
      Emit Particles
    </button>
  </div>
);
```
