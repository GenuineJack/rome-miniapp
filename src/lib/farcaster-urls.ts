const BASE = "https://farcaster.xyz";

function normalizeHash(hash: string): string | null {
  const trimmed = hash.trim().toLowerCase();
  if (!trimmed) return null;
  const stripped = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!/^[0-9a-f]+$/.test(stripped)) return null;
  // Farcaster's canonical short cast hash is 8 hex chars after the 0x prefix.
  const short = stripped.slice(0, 8);
  return `0x${short}`;
}

function normalizeUsername(username: string): string | null {
  const trimmed = username.trim().replace(/^@/, "");
  if (!trimmed) return null;
  return trimmed;
}

export type CastLike = {
  hash: string;
  author: { username: string } | string;
};

export function buildCastUrl(cast: CastLike): string | null {
  const author = typeof cast.author === "string" ? cast.author : cast.author?.username;
  const username = author ? normalizeUsername(author) : null;
  const hash = normalizeHash(cast.hash);
  if (!username || !hash) return null;
  return `${BASE}/${username}/${hash}`;
}

export function buildProfileUrl(username: string): string | null {
  const u = normalizeUsername(username);
  if (!u) return null;
  return `${BASE}/${u}`;
}

export function buildChannelUrl(channelId: string): string | null {
  const id = channelId.trim().replace(/^\//, "");
  if (!id) return null;
  return `${BASE}/~/channel/${id}`;
}

export function buildComposeUrl(text: string, embeds?: string[]): string {
  const params = new URLSearchParams({ text });
  if (embeds) {
    for (const embed of embeds) {
      if (embed) params.append("embeds[]", embed);
    }
  }
  return `${BASE}/~/compose?${params.toString()}`;
}

export function buildDmUrl(username: string): string | null {
  const u = normalizeUsername(username);
  if (!u) return null;
  return `${BASE}/~/conversations/${u}`;
}
