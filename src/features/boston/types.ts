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

export type CategoryFilter = Category | "All";

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

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    id: "back-bay",
    name: "Back Bay",
    tagline: "Brownstones and bowtie pasta. The grid was a gift.",
    description: "Boston's most walkable neighborhood, where Commonwealth Ave's mall, world-class shopping, and some of the city's best restaurants coexist with actual residents who refuse to leave.",
  },
  {
    id: "south-end",
    name: "South End",
    tagline: "Good food, better people-watching. The porches are the point.",
    description: "Victorian rowhouses and a dining scene that punches above its weight. Union Park on a Sunday morning is a life choice, not just a location.",
  },
  {
    id: "north-end",
    name: "North End",
    tagline: "If your grandmother's sauce is better, prove it.",
    description: "Every street smells like garlic. That's not a complaint. The cannoli debate is real, the feasts are annual, and Paul Revere has nothing to do with why you're here.",
  },
  {
    id: "beacon-hill",
    name: "Beacon Hill",
    tagline: "Cobblestones and old money. The brunch lines are real but so is the charm.",
    description: "Gas lamps, brick sidewalks, and a Whole Foods that feels like a luxury purchase. Louisburg Square is technically public. The vibe is not.",
  },
  {
    id: "seaport",
    name: "Seaport",
    tagline: "New money with better parking. The harbor is genuinely beautiful.",
    description: "Glass towers and expense accounts. But the waterfront is legitimate, the food hall has gotten good, and the Institute of Contemporary Art belongs here.",
  },
  {
    id: "jamaica-plain",
    name: "Jamaica Plain",
    tagline: "Arboretum, IPAs, and dogs who have their own social lives.",
    description: "JP is where people move when they want Brooklyn but need a park. The Pond, the Stonybrook farmers market, and more breweries per block than anywhere in the city.",
  },
  {
    id: "cambridge-somerville",
    name: "Cambridge / Somerville",
    tagline: "Yes, they're Cambridge-adjacent. No, they don't care what you think.",
    description: "The tech and the tacos and the graduate students. Davis Square has better bars than Harvard Square. Inman Square has better coffee than both.",
  },
  {
    id: "allston-brighton",
    name: "Allston / Brighton",
    tagline: "Student loans and late-night burritos. The music scene is real.",
    description: "Where every great band in Boston played their first show and where the rents are low enough to still have a scene. The Korean and Chinese food on Harvard Ave is genuinely excellent.",
  },
  {
    id: "dorchester",
    name: "Dorchester",
    tagline: "The biggest neighborhood in Boston. Also the most underrated.",
    description: "Dot Ave has more good food per block than the Seaport has per acre. Vietnamese, Caribbean, Cape Verdean — if you haven't eaten here, you don't know Boston.",
  },
  {
    id: "south-boston",
    name: "South Boston",
    tagline: "Gentrified but not gone. The bars close when they feel like it.",
    description: "L Street, Castle Island, and an identity that survived decades of change. The waterfront is getting expensive. The old neighborhood hangs on.",
  },
  {
    id: "charlestown",
    name: "Charlestown",
    tagline: "The Navy Yard is beautiful. The bunker is overrated.",
    description: "Tucked behind the bridge with some of the best harbor views in the city. The restaurants are underrated, the real estate is not.",
  },
  {
    id: "fenway-kenmore",
    name: "Fenway / Kenmore",
    tagline: "April through October, the whole neighborhood smells like beer. It's fine.",
    description: "The Fenway is the park, not the neighborhood — get this right. Lansdowne St is for game nights. The actual neighborhood has some of the best cheap eats in the city.",
  },
  {
    id: "downtown",
    name: "Downtown / Financial District",
    tagline: "Dead after 6pm. Good before noon.",
    description: "The lunch spots are excellent and completely empty by 2pm. Post-work drinks happen at places with names like 'The Pour House' and no one feels bad about it.",
  },
  {
    id: "east-boston",
    name: "East Boston",
    tagline: "The harbor views are free. The tacos are cheap. Come.",
    description: "Maverick Square, waterfront parks, and a Central American food scene that makes the rest of the city look slow. The ferry is faster than the Blue Line.",
  },
  {
    id: "brookline",
    name: "Brookline",
    tagline: "Technically not Boston. Practically the same. The food is better.",
    description: "Coolidge Corner and the best movie theater in Greater Boston. The deli situation is unmatched. Yes, there's a Trader Joe's. Multiple.",
  },
  // ── Regions ─────────────────────────────────────────────────────────────────
  {
    id: "north-shore",
    name: "North Shore",
    tagline: "Salem, Gloucester, Rockport, Newburyport — the coast above Boston",
    description: "The North Shore is where Boston goes when it needs to breathe. Salem in October, the working harbor at Gloucester, the rocky shore at Rockport, the brick Federal streetscapes of Newburyport. The commuter rail reaches most of it. The seafood is better than the city and less discussed about it.",
  },
  {
    id: "south-shore-cape",
    name: "South Shore & Cape",
    tagline: "Plymouth, Quincy, the Cape — Boston's summer escape valve",
    description: "South Shore is the less-celebrated sibling of the North Shore — working class, honest, better priced. Quincy is an underrated food town. Plymouth has the rock and a good waterfront. The Cape is the Cape: traffic on Friday, perfect on Tuesday, worth it in September when the crowds thin and the light changes.",
  },
  {
    id: "metro-west",
    name: "Metro West",
    tagline: "Framingham, Natick, Waltham, Newton — the arc west of the city",
    description: "MetroWest is where the suburbs get interesting. Waltham has a real restaurant scene and Lamplighter Brewing. Newton has six distinct village centers and the best public schools in the state. Framingham has a Christo mural and a downtown that's quietly having a moment. Not Boston, but Boston-adjacent in the ways that matter.",
  },
  {
    id: "central-western-mass",
    name: "Central & Western Mass",
    tagline: "Worcester, Springfield, the Pioneer Valley — the rest of the state",
    description: "Worcester is the second city and it knows it. The restaurant scene has gotten genuinely good. The DCU Center gets real acts. The Pioneer Valley — Northampton, Amherst, Holyoke — is a different Massachusetts entirely: college towns, farmland, the best Thai food in New England in a converted diner. Three hours from Boston and worth the drive.",
  },
  {
    id: "greater-new-england",
    name: "Greater New England",
    tagline: "Providence, Portland, Burlington, Manchester — the wider region",
    description: "The Northeast corridor connects Boston to a region that thinks of itself as a unit. Providence is 45 minutes and has Federal Hill and RISD. Portland, Maine has become one of the best food cities on the East Coast. Burlington, Vermont is small and serious. The builders who move between these cities share more DNA with each other than with anywhere else in the country.",
  },
];
