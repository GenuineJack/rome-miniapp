# Game SDK Documentation Structure

This directory contains LLM-optimized documentation for the Neynar Game Development SDK.

## Directory Structure

```
.llm/
├── README.md                    # This file - documentation overview
├── api-reference/              # Auto-generated API docs (from TSDoc via doc generator)
│   ├── *.llm.md                # Individual component/hook/type docs
│   └── sdk-items-registry.json # Generated index/catalog of all items
└── guides/                     # Feature guides (manually written)
    ├── game-core.llm.md        # Initialization & game loop
    ├── game-scoring.llm.md     # Points, combos, streaks
    ├── game-timers.llm.md      # Countdown, stopwatch
    ├── game-persistence.llm.md # Save systems
    ├── game-effects.llm.md     # Visual effects
    ├── game-powerups.llm.md    # Power-ups & buffs
    ├── game-ui-controls.llm.md # Layouts & controls
    └── game-utilities.llm.md   # Math & helper functions
```

## For LLMs: Documentation Navigation

### Entry Point

Start with: **[../llms.txt](../llms.txt)** - Comprehensive feature catalog with navigation protocol

### Generated API Reference

After running the doc generator (`pnpm run docs:generate:game`):

- `api-reference/sdk-items-registry.json` - Complete index of all hooks, components, types
- Individual `.llm.md` files in `api-reference/` for each API item

### Feature Guides

The `guides/` folder contains comprehensive feature documentation organized by domain (scoring, timers, effects, etc.).

## Import Path

```tsx
import {
  useScore,
  useGameLoop,
  DirectionalPad,
} from "@/neynar-farcaster-sdk/mini/game";
```

## Doc Generator

Run: `pnpm run docs:generate:game`

- Generates `api-reference/*.llm.md` files from TypeScript annotations
- Creates `sdk-items-registry.json` catalog
