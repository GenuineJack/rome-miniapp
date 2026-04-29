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
  touristPick: boolean;
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
  {
    id: "back-bay",
    name: "Back Bay",
    tagline: "Brownstones and bowtie pasta. The grid was a gift.",
    description: "Boston's most walkable neighborhood and the only part of the city with a grid because it was literally invented from scratch on landfill. Commonwealth Ave's mall is one of the great walks in American cities. Newbury Street runs eight blocks from fancy to funky. The restaurants rotate but the brownstones don't — people fight to stay here and the ones who do have strong opinions about everything. Copley Square on a warm evening is genuinely hard to leave.",
    center: [42.3503, -71.0810],
    heroImageUrl: "/images/neighborhoods/back-bay.jpg",
  },
  {
    id: "south-end",
    name: "South End",
    tagline: "Good food, better people-watching. The porches are the point.",
    description: "Victorian rowhouses with a dining scene that punches above its weight class. The South End is where Boston figured out it could have genuinely great restaurants and not just seafood shacks. Tremont Street is the spine. Union Park on a Sunday morning is a life choice, not just a location. The SoWa market in summer brings the whole neighborhood outside. If you can get a reservation at Myers + Chang without planning two weeks ahead, you're doing something wrong.",
    center: [42.3420, -71.0740],
    heroImageUrl: "/images/neighborhoods/south-end.jpg",
  },
  {
    id: "north-end",
    name: "North End",
    tagline: "If your grandmother's sauce is better, prove it.",
    description: "Every street smells like garlic and that's not a complaint. The cannoli debate between Mike's and Modern is real and anyone who says \"both\" is lying. Hanover Street on a summer Friday night is a slow parade of tourists and residents who learned to navigate around them decades ago. The feasts happen every summer — Saint Anthony's in August is the big one. The restaurants are uneven but the great ones reward the search. Paul Revere has nothing to do with why you're actually here.",
    center: [42.3636, -71.0551],
    heroImageUrl: "/images/neighborhoods/north-end.jpg",
  },
  {
    id: "beacon-hill",
    name: "Beacon Hill",
    tagline: "Cobblestones and old money. The brunch lines are real but so is the charm.",
    description: "Gas lamps on Acorn Street, brick sidewalks on Charles, and a Whole Foods that feels like a luxury purchase. Louisburg Square is technically public — the vibe is not. The Paramount for brunch has had a line since before lines were a thing restaurants bragged about. Charles Street has independent bookshops and coffee that costs more than your first apartment. The State House sits on top of the hill like it's watching you. It probably is.",
    center: [42.3588, -71.0707],
    heroImageUrl: "/images/neighborhoods/beacon-hill.jpg",
  },
  {
    id: "seaport",
    name: "Seaport",
    tagline: "New money with better parking. The harbor is genuinely beautiful.",
    description: "Glass towers and expense accounts built on what used to be parking lots. But the waterfront is legitimate and getting better every year. The ICA is world-class and half the city still hasn't been. The food hall at High Street Place has gotten good. The Harpoon Beer Hall is the democratic equalizer. Summer nights on the waterfront are genuinely competitive with any harbor city in the country. The criticism is fair — it lacks soul. It's working on it.",
    center: [42.3474, -71.0438],
    heroImageUrl: "/images/neighborhoods/seaport.jpg",
  },
  {
    id: "jamaica-plain",
    name: "Jamaica Plain",
    tagline: "Arboretum, IPAs, and dogs who have their own social lives.",
    description: "JP is where people move when they want Brooklyn energy but need a park and a pond. The Arnold Arboretum is 281 acres of Frederick Law Olmsted's best work and it's free. Centre Street has the restaurants — El Oriental de Cuba, Vee Vee, the Brendan Behan Pub. The Stonybrook farmers market is Saturday summer church. More breweries per block than anywhere else in the city. The housing fight between old JP and new JP is real but both sides eat at the same places.",
    center: [42.3097, -71.1151],
    heroImageUrl: "/images/neighborhoods/jamaica-plain.jpg",
  },
  {
    id: "cambridge-somerville",
    name: "Cambridge / Somerville",
    tagline: "Yes, they're Cambridge-adjacent. No, they don't care what you think.",
    description: "Two cities pretending to be one neighborhood and doing a decent job of it. Harvard Square has gotten corporate but the bookshops survive. Davis Square has better bars. Inman Square has better coffee than both. Somerville's Union Square got a Green Line extension and the restaurants got better before the station opened. The tech money is everywhere but so are the graduate students and the people who were here first. Central Square at 1am is still the most honest place in Greater Boston.",
    center: [42.3736, -71.1097],
    heroImageUrl: "/images/neighborhoods/cambridge-somerville.jpg",
  },
  {
    id: "allston-brighton",
    name: "Allston / Brighton",
    tagline: "Student loans and late-night burritos. The music scene is real.",
    description: "Where every great band in Boston played their first show at Great Scott (RIP) or O'Brien's. The rents are still low enough to have a scene, barely. Harvard Ave between Cambridge Street and Commonwealth is the best stretch of Korean and Chinese food in Greater Boston — not Chinatown, not the suburbs, right here. The September 1st moving crisis is a city-wide event. Brighton's restaurants are quieter and better than you'd expect. Allston Christmas is real and the couches are free.",
    center: [42.3539, -71.1337],
    heroImageUrl: "/images/neighborhoods/allston-brighton.jpg",
  },
  {
    id: "dorchester",
    name: "Dorchester",
    tagline: "The biggest neighborhood in Boston. Also the most underrated.",
    description: "Dot Ave has more good food per block than the Seaport has per acre. Vietnamese pho on Fields Corner, Caribbean in Codman Square, Cape Verdean everywhere. The triple-deckers are the architectural unit of Boston and Dorchester has more of them than anywhere. Ashmont has quietly become a destination. Savin Hill is for the people who got priced out of Southie ten years ago. If you only know Boston from the waterfront, you don't know Boston yet.",
    center: [42.2988, -71.0640],
    heroImageUrl: "/images/neighborhoods/dorchester.jpg",
  },
  {
    id: "south-boston",
    name: "South Boston",
    tagline: "Gentrified but not gone. The bars close when they feel like it.",
    description: "L Street, Castle Island, and an identity that survived decades of change and a decade of luxury condos. The old neighborhood hangs on in the dive bars and the beach walkers and the people who still call it Southie without irony. Castle Island on a summer evening is free and perfect. The waterfront is getting expensive but Broadway still has the spots. The St. Patrick's Day parade is a whole thing. Decide for yourself.",
    center: [42.3375, -71.0490],
    heroImageUrl: "/images/neighborhoods/south-boston.jpg",
  },
  {
    id: "charlestown",
    name: "Charlestown",
    tagline: "The Navy Yard is beautiful. The bunker is overrated.",
    description: "Tucked behind the bridge with some of the best harbor views in the city. The Navy Yard is genuine — old brick, waterfront walks, the USS Constitution if you're into that. The restaurants are underrated; the real estate is not. Brewer's Fork for dinner, Zume's for coffee, Monument for the view. One square mile with more history per block than most American cities have total. The bridge walk to the North End is one of Boston's best free experiences.",
    center: [42.3782, -71.0602],
    heroImageUrl: "/images/neighborhoods/charlestown.jpg",
  },
  {
    id: "fenway-kenmore",
    name: "Fenway / Kenmore",
    tagline: "April through October, the whole neighborhood smells like beer. It's fine.",
    description: "The Fenway is the park, not the neighborhood — get this right and you're ahead of most visitors. Lansdowne Street is for game nights and the bass-heavy clubs that somehow survive decade to decade. The actual neighborhood has some of the best cheap eats in the city if you know where the students go. The Gardner Museum courtyard changes every season and is never crowded enough. The MFA is one of the largest art museums in the country and it's never as packed as it should be. Kenmore Square on a Red Sox game night is pure, unreconstructed American city.",
    center: [42.3467, -71.0972],
    heroImageUrl: "/images/neighborhoods/fenway-kenmore.jpg",
  },
  {
    id: "downtown",
    name: "Downtown / Financial District",
    tagline: "Dead after 6pm. Good before noon.",
    description: "The lunch spots are excellent and completely empty by 2pm. The Financial District empties out like someone pulled a drain plug at 5:30 and the restaurants that survive on dinner traffic deserve your respect. Faneuil Hall is for tourists but the Haymarket produce vendors on Friday and Saturday are the real thing. The Freedom Trail starts here and winds through in ways that make you appreciate how small the original city was. Post-work drinks happen at places that don't try too hard and nobody feels bad about it.",
    center: [42.3554, -71.0595],
    heroImageUrl: "/images/neighborhoods/downtown.jpg",
  },
  {
    id: "east-boston",
    name: "East Boston",
    tagline: "The harbor views are free. The tacos are cheap. Come.",
    description: "Maverick Square is the front door and it's gotten better every year. The Central American food scene makes the rest of the city look slow — pupusas, tacos, the bakeries. The waterfront parks are genuinely world-class and somehow still not crowded. The ferry from Long Wharf is faster than the Blue Line and more scenic. Piers Park at sunset is one of the best free views in Boston. The neighborhood is changing fast but the core identity — working waterfront, immigrant energy, cheaper and better — holds.",
    center: [42.3709, -71.0389],
    heroImageUrl: "/images/neighborhoods/east-boston.jpg",
  },
  {
    id: "brookline",
    name: "Brookline",
    tagline: "Technically not Boston. Practically the same. The food is better.",
    description: "Coolidge Corner is the center of gravity — the Coolidge Corner Theatre is the best movie theater in Greater Boston and it's not close. The deli situation is unmatched: Zaftigs, Michael's, the works. Washington Square has a quieter scene but the restaurants are strong. The C line runs through it and makes it feel like a neighborhood, not a suburb. Yes, there are multiple Trader Joe's. The public schools are what people are actually paying for.",
    center: [42.3418, -71.1212],
    heroImageUrl: "/images/neighborhoods/brookline.jpg",
  },
  // ── Regions ─────────────────────────────────────────────────────────────────
  {
    id: "north-shore",
    name: "North Shore",
    tagline: "Salem, Gloucester, Rockport, Newburyport — the coast above Boston",
    description: "The North Shore is where Boston goes when it needs to breathe. Salem in October, the working harbor at Gloucester, the rocky shore at Rockport, the brick Federal streetscapes of Newburyport. The commuter rail reaches most of it. The seafood is better than the city and less discussed about it.",
    heroImageUrl: "/images/neighborhoods/north-shore.jpg",
  },
  {
    id: "south-shore-cape",
    name: "South Shore & Cape",
    tagline: "Plymouth, Quincy, the Cape — Boston's summer escape valve",
    description: "South Shore is the less-celebrated sibling of the North Shore — working class, honest, better priced. Quincy is an underrated food town. Plymouth has the rock and a good waterfront. The Cape is the Cape: traffic on Friday, perfect on Tuesday, worth it in September when the crowds thin and the light changes.",
    heroImageUrl: "/images/neighborhoods/south-shore-cape.jpg",
  },
  {
    id: "metro-west",
    name: "Metro West",
    tagline: "Framingham, Natick, Waltham, Newton — the arc west of the city",
    description: "MetroWest is where the suburbs get interesting. Waltham has a real restaurant scene and Lamplighter Brewing. Newton has six distinct village centers and the best public schools in the state. Framingham has a Christo mural and a downtown that's quietly having a moment. Not Boston, but Boston-adjacent in the ways that matter.",
    heroImageUrl: "/images/neighborhoods/metro-west.jpg",
  },
  {
    id: "central-western-mass",
    name: "Central & Western Mass",
    tagline: "Worcester, Springfield, the Pioneer Valley — the rest of the state",
    description: "Worcester is the second city and it knows it. The restaurant scene has gotten genuinely good. The DCU Center gets real acts. The Pioneer Valley — Northampton, Amherst, Holyoke — is a different Massachusetts entirely: college towns, farmland, the best Thai food in New England in a converted diner. Three hours from Boston and worth the drive.",
    heroImageUrl: "/images/neighborhoods/central-western-mass.jpg",
  },
  {
    id: "greater-new-england",
    name: "Greater New England",
    tagline: "Providence, Portland, Burlington, Manchester — the wider region",
    description: "The Northeast corridor connects Boston to a region that thinks of itself as a unit. Providence is 45 minutes and has Federal Hill and RISD. Portland, Maine has become one of the best food cities on the East Coast. Burlington, Vermont is small and serious. The builders who move between these cities share more DNA with each other than with anywhere else in the country.",
    heroImageUrl: "/images/neighborhoods/greater-new-england.jpg",
  },
];
