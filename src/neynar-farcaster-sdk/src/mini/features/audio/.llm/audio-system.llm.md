# Audio System Planning Guide

Complete guide for implementing sound effects and music in Neynar Mini Apps using the declarative audio system powered by Tone.js.

## System Overview

The audio system provides two main capabilities:

1. **Sound Effects (SFX)** - Short, one-shot sounds for user interactions
2. **Music** - Procedurally generated background music with multiple instruments

### Architecture

- **Tone.js Integration** - Professional web audio synthesis library
- **Jotai State Management** - Global audio state with localStorage persistence
- **Declarative API** - Define sounds and music as data structures
- **Automatic Context Management** - Audio context initialized on user interaction
- **Volume Control** - Separate volume controls for SFX and music
- **Mute Toggle** - Global mute state affecting all audio

### Core Components

1. `useSfx()` - Hook for playing sound effects
2. `useSong()` - Hook for playing background music
3. `sfx` registry - 9 built-in sound effects
4. `AudioControl` - Volume slider component
5. `MuteButton` - Mute toggle button
6. Audio atoms - `isMutedAtom`, `sfxVolumeAtom`, `musicVolumeAtom`

## Sound Effects (SFX)

### Available Instruments

The SFX system provides 7 synthesizer instruments:

1. **synth** - Basic synthesizer (sine/square/sawtooth/triangle waves)
2. **noise** - Noise generator (white/pink/brown noise)
3. **pluck** - Plucked string sound (Karplus-Strong algorithm)
4. **bass** - Low-frequency bass synth with filter
5. **fm** - FM synthesis for complex timbres
6. **metal** - Metallic/bell-like sounds
7. **membrane** - Drum-like membrane sounds

### Built-in Sound Effects

The `sfx` registry provides 9 pre-built effects:

1. **coin** - Collecting items (C5 → E5 arpeggio)
2. **jump** - Character jumping (G3 with envelope)
3. **hit** - Taking damage (noise + bass combo)
4. **powerup** - Power-up collection (C4 → E4 → G4 → C5 arpeggio)
5. **explosion** - Explosions (bass + noise + synth layered)
6. **click** - UI clicks (short C5 beep)
7. **success** - Victory/completion (ascending melodic sequence)
8. **failure** - Loss/error (descending chromatic sequence)
9. **menuSelect** - Menu navigation (pluck C5)

### Basic SFX Usage

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function MyGame() {
  const sfxPlayer = useSfx();

  return <button onClick={() => sfxPlayer.play(sfx.coin)}>Collect Coin</button>;
}
```

### Custom Sound Effect Creation

Define custom SFX in your project (e.g., `src/features/audio/custom-sfx.ts`):

```tsx
import type { SfxDefinition } from "@/neynar-farcaster-sdk/audio";

// Laser shot sound
export const laserShot: SfxDefinition = [
  {
    instrument: "fm",
    note: "E6",
    duration: "0.15",
    config: {
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    },
  },
];

// Door opening sound
export const doorOpen: SfxDefinition = [
  {
    instrument: "bass",
    note: "C2",
    duration: "0.3",
    config: {
      oscillator: "square",
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.1 },
    },
  },
];

// Bubble pop sound
export const bubblePop: SfxDefinition = [
  {
    instrument: "pluck",
    note: "G5",
    duration: "0.2",
  },
];

// Sword swing sound
export const swordSwing: SfxDefinition = [
  {
    instrument: "noise",
    duration: "0.1",
    config: {
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    },
  },
  {
    instrument: "fm",
    note: "C3",
    duration: "0.15",
    delay: 20,
  },
];

// Magic spell sound
export const magicSpell: SfxDefinition = [
  {
    instrument: "fm",
    note: "C5",
    duration: "0.2",
  },
  {
    instrument: "fm",
    note: "E5",
    duration: "0.2",
    delay: 80,
  },
  {
    instrument: "fm",
    note: "G5",
    duration: "0.3",
    delay: 160,
  },
];
```

### SFX Configuration Options

Each sound effect note can be configured:

```typescript
type SfxNote = {
  instrument:
    | "synth"
    | "noise"
    | "pluck"
    | "bass"
    | "fm"
    | "metal"
    | "membrane";
  note?: string; // Musical note (e.g., "C4", "A#3")
  duration: string; // Duration (e.g., "0.1", "0.5")
  delay?: number; // Delay in milliseconds before playing
  config?: {
    oscillator?: string; // Waveform type
    volume?: number; // Volume adjustment in dB
    envelope?: {
      // ADSR envelope
      attack?: number; // Attack time in seconds
      decay?: number; // Decay time in seconds
      sustain?: number; // Sustain level (0-1)
      release?: number; // Release time in seconds
    };
  };
};
```

## Music System

### Available Instruments

The music system provides 10 instruments for composition:

1. **melody** - Lead synth (triangle wave, single notes or chords)
2. **bassLine** - Bass synth (sawtooth wave with lowpass filter)
3. **chords** - Polyphonic pad (sine wave, plays chords)
4. **arp** - Arpeggiated pluck synth
5. **fx** - FM synth for atmospheric/bell-like sounds
6. **noise** - Pure noise for atmospheric effects
7. **metal** - Metallic/bell-like synth for shimmering sounds
8. **am** - Amplitude modulation synth for complex timbres
9. **duo** - Two-voice harmonizing synth for rich sounds
10. **drums** - Membrane synth (automatic patterns)

### Music Entry Types

```typescript
// Single note: [note, duration]
type NoteEntry = ["C4", "4n"];

// Chord: [[notes...], duration]
type ChordEntry = [["C4", "E4", "G4"], "4n"];

// Rest (silence): ["rest", duration]
type RestEntry = ["rest", "4n"];

// Duration values:
// "1n" = whole note
// "2n" = half note
// "4n" = quarter note
// "8n" = eighth note
// "16n" = sixteenth note
```

### Basic Music Usage

Define a song in your project (e.g., `src/features/audio/theme-song.ts`):

```tsx
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";

export const themeSong: SongDefinition = {
  tempo: 120, // BPM
  sections: {
    intro: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "4n"],
        ["C5", "4n"],
      ],
      drumPattern: "none",
    },
    verse: {
      melody: [
        ["C4", "8n"],
        ["D4", "8n"],
        ["E4", "8n"],
        ["F4", "8n"],
        ["G4", "8n"],
        ["A4", "8n"],
        ["G4", "8n"],
        ["F4", "8n"],
      ],
      bassLine: [
        ["C2", "4n"],
        ["C2", "4n"],
        ["G2", "4n"],
        ["G2", "4n"],
      ],
      chords: [
        [["C4", "E4", "G4"], "2n"],
        [["G3", "B3", "D4"], "2n"],
      ],
      drumPattern: "simple",
    },
  },
  structure: ["intro", "verse", "verse"],
};
```

Play the song:

```tsx
import { useSong } from "@/neynar-farcaster-sdk/audio";
import { themeSong } from "@/features/audio/theme-song";

function MyGame() {
  const { play, stop } = useSong();

  return (
    <>
      <button onClick={() => play(themeSong)}>Play Music</button>
      <button onClick={stop}>Stop Music</button>
    </>
  );
}
```

### Drum Patterns

Four built-in drum patterns:

1. **none** - No drums
2. **simple** - Basic kick (1, 3) and snare (2, 4)
3. **complex** - Simple + hi-hat on off-beats
4. **heavy** - Double kicks, constant hi-hats, extra snare hits

```tsx
sections: {
  intro: {
    melody: [["C4", "4n"]],
    drumPattern: "none",
  },
  verse: {
    melody: [["C4", "4n"]],
    drumPattern: "simple",  // Kick and snare
  },
  chorus: {
    melody: [["C4", "4n"]],
    drumPattern: "heavy",   // Intense drums
  },
}
```

### Per-Section Instrument Configuration

Customize instrument sound per section:

```tsx
const song: SongDefinition = {
  tempo: 120,
  sections: {
    verse: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
      ],
      config: {
        melody: {
          oscillator: "square",
          volume: 2,
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
        },
      },
    },
    chorus: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
      ],
      config: {
        melody: {
          oscillator: "sawtooth", // Different timbre for chorus
          volume: 5,
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.8, release: 1 },
        },
      },
    },
  },
  structure: ["verse", "chorus"],
};
```

### Per-Section Tempo Changes

Override song-level tempo in specific sections:

```tsx
const song: SongDefinition = {
  tempo: 120, // Default tempo
  sections: {
    intro: {
      melody: [["C4", "4n"]],
      tempo: 90, // Slower intro
    },
    verse: {
      melody: [["C4", "4n"]],
      // Uses default 120 BPM
    },
    climax: {
      melody: [["C4", "4n"]],
      tempo: 150, // Faster climax
    },
  },
  structure: ["intro", "verse", "climax"],
};
```

## Audio State Management

### Jotai Atoms

Three global atoms manage audio state with localStorage persistence:

```tsx
// All three atoms automatically persist to localStorage
export const isMutedAtom = atomWithStorage<boolean>("game-audio-muted", false);
export const sfxVolumeAtom = atomWithStorage<number>("game-sfx-volume", 0.7);
export const musicVolumeAtom = atomWithStorage<number>(
  "game-music-volume",
  0.5,
);
```

### Direct Atom Access

Access atoms directly in components:

```tsx
import { useAtom } from "jotai";
import {
  isMutedAtom,
  sfxVolumeAtom,
  musicVolumeAtom,
} from "@/neynar-farcaster-sdk/audio";

function CustomAudioSettings() {
  const [isMuted, setIsMuted] = useAtom(isMutedAtom);
  const [sfxVolume, setSfxVolume] = useAtom(sfxVolumeAtom);
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);

  return (
    <div>
      <button onClick={() => setIsMuted(!isMuted)}>
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={sfxVolume}
        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

## UI Components

### AudioControl Component

Volume sliders for SFX and music:

```tsx
import { AudioControl } from "@/neynar-farcaster-sdk/audio";

function SettingsMenu() {
  return (
    <div>
      <h2>Audio Settings</h2>
      <AudioControl />
    </div>
  );
}
```

### MuteButton Component

Standalone mute toggle:

```tsx
import { MuteButton } from "@/neynar-farcaster-sdk/audio";

function GameUI() {
  return (
    <div>
      {/* Icon-only button */}
      <MuteButton />

      {/* Button with text */}
      <MuteButton>Mute</MuteButton>
    </div>
  );
}
```

### Combined Audio Controls

```tsx
import { AudioControl, MuteButton } from "@/neynar-farcaster-sdk/audio";

function AudioSettings() {
  return (
    <div className="space-y-4">
      <MuteButton className="w-full">Toggle Mute</MuteButton>
      <AudioControl />
    </div>
  );
}
```

## Pattern Examples

### 1. Button Click Sound

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function GameButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const sfxPlayer = useSfx();

  const handleClick = () => {
    sfxPlayer.play(sfx.click);
    onClick();
  };

  return <button onClick={handleClick}>{children}</button>;
}
```

### 2. Simple Background Music Loop

```tsx
import { useSong } from "@/neynar-farcaster-sdk/audio";
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";
import { useEffect } from "react";

const backgroundMusic: SongDefinition = {
  tempo: 100,
  sections: {
    loop: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "4n"],
        ["E4", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      drumPattern: "simple",
    },
  },
  structure: ["loop"], // Will loop indefinitely
};

function Game() {
  const { play, stop } = useSong();

  useEffect(() => {
    play(backgroundMusic);
    return () => stop();
  }, []);

  return <div>Game content...</div>;
}
```

### 3. Dynamic Music Based on Game State

```tsx
import { useSong } from "@/neynar-farcaster-sdk/audio";
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";
import { useEffect } from "react";

const calmMusic: SongDefinition = {
  tempo: 80,
  sections: {
    calm: {
      melody: [
        ["C4", "2n"],
        ["E4", "2n"],
      ],
      drumPattern: "none",
    },
  },
  structure: ["calm"],
};

const intenseMu: SongDefinition = {
  tempo: 160,
  sections: {
    intense: {
      melody: [
        ["C5", "8n"],
        ["D5", "8n"],
        ["E5", "8n"],
        ["F5", "8n"],
      ],
      bassLine: [
        ["C2", "4n"],
        ["C2", "4n"],
      ],
      drumPattern: "heavy",
    },
  },
  structure: ["intense"],
};

function Game() {
  const { play, stop } = useSong();
  const [enemyCount, setEnemyCount] = useState(0);

  useEffect(() => {
    if (enemyCount > 5) {
      play(intenseMusic);
    } else {
      play(calmMusic);
    }
  }, [enemyCount]);

  return <div>Enemy count: {enemyCount}</div>;
}
```

### 4. Collecting Items with SFX

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function Game() {
  const sfxPlayer = useSfx();
  const [score, setScore] = useState(0);

  const collectCoin = () => {
    sfxPlayer.play(sfx.coin);
    setScore((s) => s + 10);
  };

  const collectPowerup = () => {
    sfxPlayer.play(sfx.powerup);
    setScore((s) => s + 50);
  };

  return (
    <div>
      <p>Score: {score}</p>
      <button onClick={collectCoin}>Collect Coin</button>
      <button onClick={collectPowerup}>Collect Powerup</button>
    </div>
  );
}
```

### 5. Game with Multiple SFX Types

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function Game() {
  const sfxPlayer = useSfx();
  const [hp, setHp] = useState(100);

  const jump = () => {
    sfxPlayer.play(sfx.jump);
  };

  const takeDamage = () => {
    sfxPlayer.play(sfx.hit);
    setHp((h) => Math.max(0, h - 10));
  };

  const shoot = () => {
    sfxPlayer.play(sfx.explosion);
  };

  return (
    <div>
      <p>HP: {hp}</p>
      <button onClick={jump}>Jump</button>
      <button onClick={shoot}>Shoot</button>
      <button onClick={takeDamage}>Take Damage</button>
    </div>
  );
}
```

### 6. Success/Failure Feedback

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function Quiz() {
  const sfxPlayer = useSfx();

  const checkAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      sfxPlayer.play(sfx.success);
      // Show success message
    } else {
      sfxPlayer.play(sfx.failure);
      // Show error message
    }
  };

  return (
    <div>
      <button onClick={() => checkAnswer(true)}>Correct Answer</button>
      <button onClick={() => checkAnswer(false)}>Wrong Answer</button>
    </div>
  );
}
```

### 7. Complex Multi-Instrument Song

```tsx
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";

export const epicTheme: SongDefinition = {
  tempo: 140,
  sections: {
    intro: {
      melody: [
        ["C5", "4n"],
        ["D5", "4n"],
        ["E5", "4n"],
        ["G5", "4n"],
      ],
      fx: [
        ["C6", "2n"],
        ["rest", "2n"],
      ],
      drumPattern: "none",
    },
    verse: {
      melody: [
        ["C4", "8n"],
        ["D4", "8n"],
        ["E4", "8n"],
        ["G4", "8n"],
        ["C4", "8n"],
        ["D4", "8n"],
        ["E4", "8n"],
        ["G4", "8n"],
      ],
      bassLine: [
        ["C2", "4n"],
        ["C2", "4n"],
        ["G2", "4n"],
        ["G2", "4n"],
      ],
      chords: [
        [["C4", "E4", "G4"], "2n"],
        [["G3", "B3", "D4"], "2n"],
      ],
      arp: [
        ["C5", "16n"],
        ["E5", "16n"],
        ["G5", "16n"],
        ["C6", "16n"],
        ["C5", "16n"],
        ["E5", "16n"],
        ["G5", "16n"],
        ["C6", "16n"],
      ],
      drumPattern: "simple",
    },
    chorus: {
      melody: [
        ["C5", "4n"],
        ["E5", "4n"],
        ["G5", "4n"],
        ["C6", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      chords: [
        [["C4", "E4", "G4", "C5"], "2n"],
        [["G3", "B3", "D4", "G4"], "2n"],
      ],
      metal: [
        ["C6", "8n"],
        ["rest", "8n"],
        ["C6", "8n"],
        ["rest", "8n"],
      ],
      drumPattern: "heavy",
    },
    outro: {
      melody: [["C5", "1n"]],
      chords: [[["C3", "E3", "G3", "C4"], "1n"]],
      drumPattern: "none",
    },
  },
  structure: ["intro", "verse", "chorus", "verse", "chorus", "outro"],
};
```

### 8. Menu Navigation with SFX

```tsx
import { useSfx, sfx } from "@/neynar-farcaster-sdk/audio";

function Menu() {
  const sfxPlayer = useSfx();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItems = ["Play", "Settings", "Quit"];

  const navigate = (direction: "up" | "down") => {
    sfxPlayer.play(sfx.menuSelect);
    setSelectedIndex((i) => {
      if (direction === "up") return Math.max(0, i - 1);
      return Math.min(menuItems.length - 1, i + 1);
    });
  };

  const select = () => {
    sfxPlayer.play(sfx.click);
    // Handle selection
  };

  return (
    <div>
      {menuItems.map((item, idx) => (
        <button
          key={item}
          onMouseEnter={() => {
            sfxPlayer.play(sfx.menuSelect);
            setSelectedIndex(idx);
          }}
          onClick={select}
          style={{ fontWeight: idx === selectedIndex ? "bold" : "normal" }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
```

### 9. Game with Layered Music Tracks

```tsx
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";

// Start with minimal music
const level1Music: SongDefinition = {
  tempo: 110,
  sections: {
    main: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "4n"],
        ["E4", "4n"],
      ],
      drumPattern: "simple",
    },
  },
  structure: ["main"],
};

// Add bass and more complexity
const level2Music: SongDefinition = {
  tempo: 120,
  sections: {
    main: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "4n"],
        ["E4", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      drumPattern: "complex",
    },
  },
  structure: ["main"],
};

// Full arrangement
const level3Music: SongDefinition = {
  tempo: 130,
  sections: {
    main: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "4n"],
        ["E4", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      chords: [
        [["C4", "E4", "G4"], "2n"],
        [["G3", "B3", "D4"], "2n"],
      ],
      arp: [
        ["C5", "16n"],
        ["E5", "16n"],
        ["G5", "16n"],
        ["C6", "16n"],
      ],
      drumPattern: "heavy",
    },
  },
  structure: ["main"],
};

function Game() {
  const { play } = useSong();
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (level === 1) play(level1Music);
    else if (level === 2) play(level2Music);
    else play(level3Music);
  }, [level]);

  return <div>Level: {level}</div>;
}
```

### 10. Custom Sound Effects Library

Create a centralized library for your game:

```tsx
// src/features/audio/game-sfx.ts
import type { SfxDefinition } from "@/neynar-farcaster-sdk/audio";

export const gameSfx = {
  // Weapon sounds
  laser: [
    { instrument: "fm" as const, note: "E6", duration: "0.1" },
  ] as SfxDefinition,

  sword: [
    { instrument: "noise" as const, duration: "0.08" },
    { instrument: "fm" as const, note: "C3", duration: "0.12", delay: 20 },
  ] as SfxDefinition,

  // Environmental sounds
  doorOpen: [
    {
      instrument: "bass" as const,
      note: "C2",
      duration: "0.3",
      config: {
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.1 },
      },
    },
  ] as SfxDefinition,

  footstep: [
    { instrument: "noise" as const, duration: "0.05" },
    { instrument: "membrane" as const, note: "C2", duration: "0.05" },
  ] as SfxDefinition,

  // UI sounds
  buttonHover: [
    { instrument: "pluck" as const, note: "C5", duration: "0.05" },
  ] as SfxDefinition,

  pageTransition: [
    { instrument: "fm" as const, note: "C4", duration: "0.15" },
    { instrument: "fm" as const, note: "E4", duration: "0.15", delay: 80 },
  ] as SfxDefinition,
};

// Usage:
// import { useSfx } from '@/neynar-farcaster-sdk/audio';
// import { gameSfx } from '@/features/audio/game-sfx';
//
// const sfxPlayer = useSfx();
// sfxPlayer.play(gameSfx.laser);
```

### 11. Music with Intro, Loop, and Outro

```tsx
import type { SongDefinition } from "@/neynar-farcaster-sdk/audio";

const songWithStructure: SongDefinition = {
  tempo: 120,
  sections: {
    intro: {
      melody: [
        ["C4", "4n"],
        ["E4", "4n"],
        ["G4", "2n"],
      ],
      drumPattern: "none",
    },
    loopA: {
      melody: [
        ["C4", "4n"],
        ["D4", "4n"],
        ["E4", "4n"],
        ["F4", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      drumPattern: "simple",
    },
    loopB: {
      melody: [
        ["G4", "4n"],
        ["F4", "4n"],
        ["E4", "4n"],
        ["D4", "4n"],
      ],
      bassLine: [
        ["C2", "2n"],
        ["G2", "2n"],
      ],
      drumPattern: "simple",
    },
    outro: {
      melody: [["C4", "1n"]],
      chords: [[["C3", "E3", "G3"], "1n"]],
      drumPattern: "none",
    },
  },
  // Plays: intro once, then loops A and B, ending with outro when stopped
  structure: ["intro", "loopA", "loopB", "loopA", "loopB"],
};
```

### 12. Volume Persistence Demo

```tsx
import { AudioControl, MuteButton } from "@/neynar-farcaster-sdk/audio";
import { useAtom } from "jotai";
import {
  sfxVolumeAtom,
  musicVolumeAtom,
  isMutedAtom,
} from "@/neynar-farcaster-sdk/audio";

function SettingsPanel() {
  const [sfxVolume] = useAtom(sfxVolumeAtom);
  const [musicVolume] = useAtom(musicVolumeAtom);
  const [isMuted] = useAtom(isMutedAtom);

  return (
    <div>
      <h2>Audio Settings</h2>
      <p>These settings persist across page reloads via localStorage</p>

      <div className="mb-4">
        <MuteButton className="w-full">
          {isMuted ? "Unmute" : "Mute"} All Audio
        </MuteButton>
      </div>

      <AudioControl />

      <div className="mt-4 text-sm text-gray-600">
        <p>Current SFX Volume: {(sfxVolume * 100).toFixed(0)}%</p>
        <p>Current Music Volume: {(musicVolume * 100).toFixed(0)}%</p>
        <p>Muted: {isMuted ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
```

## Musical Reference

### Common Chords

```typescript
// Major chords
const CMajor = ["C4", "E4", "G4"];
const GMajor = ["G3", "B3", "D4"];
const FMajor = ["F3", "A3", "C4"];

// Minor chords
const AMinor = ["A3", "C4", "E4"];
const EMinor = ["E3", "G3", "B3"];
const DMinor = ["D3", "F3", "A3"];

// Seventh chords
const CMajor7 = ["C4", "E4", "G4", "B4"];
const G7 = ["G3", "B3", "D4", "F4"];
```

### Common Scales

```typescript
// C Major scale
const cMajorScale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

// A Minor scale
const aMinorScale = ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"];

// C Pentatonic scale
const cPentatonic = ["C4", "D4", "E4", "G4", "A4", "C5"];
```

### Note Duration Reference

```typescript
// Whole note (4 beats)
["C4", "1n"][
  // Half note (2 beats)
  ("C4", "2n")
][
  // Quarter note (1 beat)
  ("C4", "4n")
][
  // Eighth note (0.5 beats)
  ("C4", "8n")
][
  // Sixteenth note (0.25 beats)
  ("C4", "16n")
][
  // Dotted notes (1.5x duration)
  ("C4", "4n.")
][ // Dotted quarter = 1.5 beats
  // Triplets
  ("C4", "4t")
][("C4", "8t")]; // Quarter note triplet // Eighth note triplet
```

## Mobile Audio Considerations

### Autoplay Restrictions

Browsers require user interaction before audio can play:

```tsx
import { useSfx, useSong } from "@/neynar-farcaster-sdk/audio";
import { useEffect, useState } from "react";

function Game() {
  const sfxPlayer = useSfx();
  const { play } = useSong();
  const [audioInitialized, setAudioInitialized] = useState(false);

  const initializeAudio = async () => {
    // Initialize on first user interaction
    await sfxPlayer.init();
    setAudioInitialized(true);
  };

  return (
    <div>
      {!audioInitialized ? (
        <button onClick={initializeAudio}>Start Game (Initialize Audio)</button>
      ) : (
        <div>Game content...</div>
      )}
    </div>
  );
}
```

### Audio Context Initialization

The SFX system automatically initializes Tone.js on first play:

```tsx
function Game() {
  const sfxPlayer = useSfx();

  const handleStart = () => {
    // First play() call will initialize audio context
    // This must be triggered by user interaction
    sfxPlayer.play(sfx.click);
  };

  return <button onClick={handleStart}>Start Game</button>;
}
```

### Performance Optimization

Avoid creating multiple audio instances:

```tsx
// Good: Single useSfx() call per component tree
function Game() {
  const sfxPlayer = useSfx();

  return (
    <>
      <Player sfxPlayer={sfxPlayer} />
      <Enemies sfxPlayer={sfxPlayer} />
      <UI sfxPlayer={sfxPlayer} />
    </>
  );
}

// Avoid: Multiple useSfx() calls (creates duplicate instruments)
function BadExample() {
  const sfxPlayer1 = useSfx(); // Creates 7 instruments
  const sfxPlayer2 = useSfx(); // Creates 7 MORE instruments
  // ...
}
```

## Tone.js Integration Details

### Volume Conversion

The system converts 0-1 volume to decibels:

```typescript
// SFX: 0-1 range maps to -5dB to +5dB
const dB = sfxVolume * 10 - 5;

// Music: 0-1 range maps to -15dB to -5dB (quieter default)
const dB = musicVolume * 10 - 15;
```

### Instrument Volume Offsets

Different instruments have volume offsets for better mix:

```typescript
// Music instruments (relative to base dB):
lead.volume = dB; // 0 offset
bass.volume = dB; // 0 offset
pad.volume = dB; // 0 offset
arp.volume = dB - 3; // -3dB quieter
fx.volume = dB - 5; // -5dB quieter
noise.volume = dB - 8; // -8dB quieter
drums.volume = dB + 3; // +3dB louder
metal.volume = dB - 2; // -2dB quieter
am.volume = dB - 1; // -1dB quieter
duo.volume = dB; // 0 offset
```

### Mute Implementation

When muted or volume is 0, instruments are set to -Infinity dB:

```typescript
if (isMuted || volume === 0) {
  instrument.volume.value = -Infinity; // Completely silent
}
```

## Best Practices

### 1. Initialize Audio on User Interaction

Always start audio in response to user action (browser requirement):

```tsx
function Game() {
  const sfxPlayer = useSfx();

  // Good: Audio starts on button click
  return <button onClick={() => sfxPlayer.play(sfx.click)}>Start</button>;

  // Bad: Trying to play audio on page load (will fail)
  // useEffect(() => { sfxPlayer.play(sfx.click); }, []);
}
```

### 2. Provide Audio Controls

Always give users control over audio:

```tsx
import { AudioControl, MuteButton } from "@/neynar-farcaster-sdk/audio";

function Settings() {
  return (
    <div>
      <MuteButton />
      <AudioControl />
    </div>
  );
}
```

### 3. Use Appropriate SFX for Actions

Match sound effects to action types:

```tsx
sfxPlayer.play(sfx.click); // UI interactions
sfxPlayer.play(sfx.coin); // Collecting items
sfxPlayer.play(sfx.jump); // Character movement
sfxPlayer.play(sfx.hit); // Taking damage
sfxPlayer.play(sfx.powerup); // Power-ups
sfxPlayer.play(sfx.explosion); // Explosions
sfxPlayer.play(sfx.success); // Achievements
sfxPlayer.play(sfx.failure); // Errors
```

### 4. Layer Sounds for Rich Effects

Combine multiple instruments for complex sounds:

```tsx
const complexExplosion: SfxDefinition = [
  { instrument: "bass", note: "A1", duration: "0.4" }, // Low rumble
  { instrument: "noise", duration: "0.15" }, // White noise burst
  { instrument: "synth", note: "G2", duration: "0.15", delay: 20 },
  { instrument: "metal", note: "C3", duration: "0.3", delay: 40 },
];
```

### 5. Keep Music Sections Modular

Design reusable sections for dynamic music:

```tsx
const music: SongDefinition = {
  tempo: 120,
  sections: {
    intro: {
      /* ... */
    },
    calm: {
      /* ... */
    },
    tense: {
      /* ... */
    },
    action: {
      /* ... */
    },
    victory: {
      /* ... */
    },
  },
  // Rearrange dynamically based on game state
  structure: ["intro", "calm", "calm", "tense", "action"],
};
```

### 6. Use Rests for Rhythm

Add "rest" entries for musical breathing room:

```tsx
melody: [
  ["C4", "4n"],
  ["E4", "4n"],
  ["rest", "4n"], // Silence for one beat
  ["G4", "4n"],
];
```

### 7. Test on Mobile Devices

Audio behaves differently on mobile:

- Test volume levels on mobile speakers
- Verify autoplay restrictions are handled
- Check performance with multiple simultaneous sounds
- Test with headphones and speakers

### 8. Balance Volume Levels

Adjust instrument volumes for a good mix:

```tsx
config: {
  melody: { volume: 0 },    // 0dB (normal)
  bassLine: { volume: -2 }, // -2dB (slightly quieter)
  drums: { volume: 3 },     // +3dB (louder)
}
```

### 9. Use Envelopes for Dynamics

Control attack/decay/sustain/release for expressive sounds:

```tsx
{
  instrument: "synth",
  note: "C4",
  duration: "0.5",
  config: {
    envelope: {
      attack: 0.01,   // Fast attack
      decay: 0.2,     // Quick decay
      sustain: 0.3,   // Low sustain
      release: 0.5,   // Moderate release
    },
  },
}
```

### 10. Clean Up on Unmount

The hooks handle cleanup automatically, but be aware:

```tsx
// useSfx() disposes instruments on unmount
// useSong() keeps player alive across component unmounts
```

## Troubleshooting

### Audio Not Playing

1. Check if audio was initialized after user interaction
2. Verify isMutedAtom is false
3. Check volume atoms are > 0
4. Confirm note names are valid (e.g., "C4", not "c4")

### Audio Sounds Distorted

1. Reduce volume in config objects
2. Avoid playing too many simultaneous sounds
3. Lower master volume via atoms
4. Check for audio clipping in complex music

### Music Not Looping

Music loops automatically using the structure array:

```tsx
structure: ["intro", "verse", "chorus"]; // Loops all sections
```

### Audio Cuts Off Early

Increase duration or release time:

```tsx
{
  duration: "0.5",  // Longer duration
  config: {
    envelope: { release: 1.0 }  // Longer release
  }
}
```

### Performance Issues

1. Limit simultaneous SFX playback
2. Use simpler drum patterns
3. Reduce number of instrument layers
4. Simplify ADSR envelopes

## TypeScript Types Reference

```typescript
// SFX Types
type SfxInstrument =
  | "synth"
  | "noise"
  | "pluck"
  | "bass"
  | "fm"
  | "metal"
  | "membrane";

type SfxNote = {
  instrument: SfxInstrument;
  note?: string;
  duration: string;
  delay?: number;
  config?: {
    oscillator?: string;
    volume?: number;
    envelope?: {
      attack?: number;
      decay?: number;
      sustain?: number;
      release?: number;
    };
  };
};

type SfxDefinition = SfxNote[];

// Music Types
type NoteValue = Tone.Unit.Frequency; // "C4", "A#3", etc.
type NoteDuration = "8n" | "4n" | "16n" | "2n" | "1n";
type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

type NoteEntry = [NoteValue, NoteDuration];
type ChordEntry = [NoteValue[], NoteDuration];
type RestEntry = ["rest", NoteDuration];
type MusicEntry = NoteEntry | ChordEntry | RestEntry;

type InstrumentConfig = {
  oscillator?: OscillatorType;
  volume?: number;
  envelope?: {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
  };
};

type SongSection = {
  melody?: MusicEntry[];
  bassLine?: (NoteEntry | RestEntry)[];
  chords?: (ChordEntry | RestEntry)[];
  arp?: (NoteEntry | RestEntry)[];
  fx?: (NoteEntry | RestEntry)[];
  noise?: (NoteEntry | RestEntry)[];
  metal?: (NoteEntry | RestEntry)[];
  am?: (NoteEntry | RestEntry)[];
  duo?: (NoteEntry | RestEntry)[];
  drumPattern?: "simple" | "complex" | "heavy" | "none";
  tempo?: number;
  config?: {
    melody?: InstrumentConfig;
    bassLine?: InstrumentConfig;
    chords?: InstrumentConfig;
    arp?: InstrumentConfig;
    fx?: InstrumentConfig;
    noise?: InstrumentConfig;
    metal?: InstrumentConfig;
    am?: InstrumentConfig;
    duo?: InstrumentConfig;
  };
};

type SongDefinition = {
  sections: Record<string, SongSection>;
  structure: string[];
  tempo?: number;
};
```

## Summary

The Neynar audio system provides:

- **Simple API** - Declarative sound and music definitions
- **9 Built-in SFX** - Ready-to-use sound effects
- **10 Music Instruments** - Rich musical compositions
- **State Management** - Jotai atoms with persistence
- **UI Components** - Volume controls and mute button
- **Mobile Support** - Handles autoplay restrictions
- **Type Safety** - Full TypeScript support
- **Tone.js Power** - Professional audio synthesis

Use `useSfx()` for short sounds, `useSong()` for background music, and the built-in `sfx` registry for common game sounds. Combine with `AudioControl` and `MuteButton` components for a complete audio experience.
