import {
  Pizza,
  Coffee,
  Wine,
  Trees,
  Palette,
  ShoppingBag,
  Wrench,
  Gem,
  Code2,
  Handshake,
  Compass,
  Link2,
  Rocket,
  DollarSign,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type RomeTab = "explore" | "vivere" | "today" | "attendees" | "dispatch";

export type RomeSpot = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  neighborhood: string;
  description: string;
  address: string | null;
  link: string | null;
  latitude: number | null;
  longitude: number | null;
  submittedByFid: number;
  submittedByUsername: string;
  submittedByDisplayName: string;
  submittedByPfpUrl: string | null;
  featured: boolean;
  status: string;
  createdAt: Date;
};

export type RomeEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  lumaUrl: string | null;
  organizerName: string | null;
  category: string | null;
  submittedByFid: number | null;
  submittedByUsername: string | null;
  featured: boolean;
  status: string;
  createdAt: Date;
};

export type RomeAttendee = {
  id: string;
  fid: number | null;
  username: string | null;
  displayName: string;
  pfpUrl: string | null;
  bio: string | null;
  walletAddress: string | null;
  ticketVerified: boolean;
  contractAddress: string | null;
  selfAdded: boolean;
  createdAt: Date;
};

export type Category =
  | "Food & Drink"
  | "Coffee"
  | "Nightlife"
  | "Outdoors"
  | "Culture"
  | "Shopping"
  | "Services"
  | "Hidden Gems";

export type SpotStatus = "pending" | "approved" | "rejected";

export type Spot = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  neighborhood: string;
  description: string;
  address: string | null;
  link: string | null;
  latitude: number | null;
  longitude: number | null;
  submittedByFid: number;
  submittedByUsername: string;
  submittedByDisplayName: string;
  submittedByPfpUrl: string | null;
  featured: boolean;
  status: string;
  touristPick?: boolean;
  createdAt: Date;
};

export type BuilderCategory =
  | "Shipping Code"
  | "Design & Creative"
  | "Community"
  | "Strategy & Ops"
  | "Crypto Native"
  | "Founder"
  | "Investor"
  | "Other";

export const BUILDER_CATEGORIES: BuilderCategory[] = [
  "Shipping Code",
  "Design & Creative",
  "Community",
  "Strategy & Ops",
  "Crypto Native",
  "Founder",
  "Investor",
  "Other",
];

export const BUILDER_CATEGORY_ICONS: Record<BuilderCategory, string> = {
  "Shipping Code": "⌨️",
  "Design & Creative": "🎨",
  "Community": "🤝",
  "Strategy & Ops": "📐",
  "Crypto Native": "⛓️",
  "Founder": "🚀",
  "Investor": "💰",
  "Other": "✦",
};

export type Builder = {
  id: string;
  fid: number;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  projectName: string | null;
  projectUrl: string | null;
  neighborhood: string | null;
  category: string | null;
  projectLinks: string[];   // JSON-parsed from DB text column
  categories: string[];     // JSON-parsed from DB text column
  talkAbout: string | null;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  // Derived (populated at query time, not stored):
  spotCount?: number;
};

export type NeighborhoodInfo = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  center?: [number, number]; // [lat, lng] for scoped map
  heroImageUrl?: string;
};

export type ActiveTab = "explore" | "neighborhoods" | "today" | "builders" | "new";

export const REGION_IDS = new Set([
  "north-shore",
  "south-shore-cape",
  "metro-west",
  "central-western-mass",
  "greater-new-england",
]);

export type BostonGame = {
  id: string;
  team: "Celtics" | "Bruins" | "Red Sox" | "Patriots" | "Revolution";
  emoji: string;
  opponent: string;
  date: string;
  time: string;
  venue: string;
  status: "upcoming" | "live" | "final";
  score?: { home: number; away: number };
};

export type Happening = {
  id: string;
  timing: string;
  title: string;
  description: string;
  relatedNeighborhood: string;
  emoji: string;
};

export type CommunityHappening = {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  dateLabel: string;
  startDate: string | null;
  endDate: string | null;
  emoji: string;
  url: string | null;
  submittedByFid: number;
  submittedByUsername: string;
  submittedByDisplayName: string;
  submittedByPfpUrl: string | null;
  status: string;
  createdAt: Date;
};

export type CategoryFilter = Category | "All" | "Tourist Picks";

export const CATEGORIES: Category[] = [
  "Food & Drink",
  "Coffee",
  "Nightlife",
  "Outdoors",
  "Culture",
  "Shopping",
  "Services",
  "Hidden Gems",
];

export const CATEGORY_ICONS: Record<Category, string> = {
  "Food & Drink": "🍕",
  "Coffee": "☕",
  "Nightlife": "🍸",
  "Outdoors": "🌳",
  "Culture": "🎨",
  "Shopping": "🛍️",
  "Services": "🔧",
  "Hidden Gems": "💎",
};

export const CATEGORY_LUCIDE: Record<Category, LucideIcon> = {
  "Food & Drink": Pizza,
  "Coffee": Coffee,
  "Nightlife": Wine,
  "Outdoors": Trees,
  "Culture": Palette,
  "Shopping": ShoppingBag,
  "Services": Wrench,
  "Hidden Gems": Gem,
};

export const BUILDER_CATEGORY_LUCIDE: Record<BuilderCategory, LucideIcon> = {
  "Shipping Code": Code2,
  "Design & Creative": Palette,
  "Community": Handshake,
  "Strategy & Ops": Compass,
  "Crypto Native": Link2,
  "Founder": Rocket,
  "Investor": DollarSign,
  "Other": Sparkles,
};

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  { id: "centro-storico", name: "Centro Storico", tagline: "Ancient streets, modern builders.", description: "Historic core with the densest mix of landmarks, cafes, and late-night energy.", center: [41.8967, 12.4822], heroImageUrl: "/images/neighborhoods/centro-storico.jpg" },
  { id: "trastevere", name: "Trastevere", tagline: "Cobblestones and conversation.", description: "Riverside neighborhood full of trattorias, wine bars, and all-night social gravity.", center: [41.8897, 12.4663], heroImageUrl: "/images/neighborhoods/trastevere.jpg" },
  { id: "testaccio", name: "Testaccio", tagline: "Food-first, no pretense.", description: "Roman food traditions, market culture, and easy access to the venue area.", center: [41.8758, 12.4769], heroImageUrl: "/images/neighborhoods/testaccio.jpg" },
  { id: "ostiense", name: "Ostiense", tagline: "Industrial vibe, builder energy.", description: "Closest district to Industrie Fluviali with murals, bars, and startup density.", center: [41.8737, 12.4792], heroImageUrl: "/images/neighborhoods/ostiense.jpg" },
  { id: "garbatella", name: "Garbatella", tagline: "Village feel near the action.", description: "Leafy pockets and quiet courtyards a short walk from venue-adjacent metro stops.", center: [41.8676, 12.4862], heroImageUrl: "/images/neighborhoods/garbatella.jpg" },
  { id: "monti", name: "Monti", tagline: "Boutiques, espresso, and side quests.", description: "Compact central quarter with independent shops and strong aperitivo options.", center: [41.8955, 12.4942], heroImageUrl: "/images/neighborhoods/monti.jpg" },
  { id: "prati", name: "Prati", tagline: "Elegant blocks and fast transit.", description: "Broad boulevards, dependable restaurants, and direct metro access.", center: [41.9094, 12.4665], heroImageUrl: "/images/neighborhoods/prati.jpg" },
  { id: "san-lorenzo", name: "San Lorenzo", tagline: "Student energy, late hours.", description: "Affordable bars and casual food scene for post-session decompression.", center: [41.8998, 12.5144], heroImageUrl: "/images/neighborhoods/san-lorenzo.jpg" },
  { id: "eur", name: "EUR", tagline: "Wide avenues, modern Rome.", description: "Business district with metro convenience and spacious architecture.", center: [41.8329, 12.4660], heroImageUrl: "/images/neighborhoods/eur.jpg" },
  { id: "vatican", name: "Vatican", tagline: "Monumental and always moving.", description: "High-footfall zone with landmarks, museums, and dense tourist logistics.", center: [41.9029, 12.4534], heroImageUrl: "/images/neighborhoods/vatican.jpg" }
];
