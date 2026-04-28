export type TeamMetadata = {
  name: string;
  emoji: string;
  fullName: string;
  sport: string;
  venue: string;
  venueCoords: [number, number];
  bio: string;
  championships: string[];
  scheduleUrl: string;
  founded: number;
  colors: string;
};

export const TEAM_METADATA: Record<string, TeamMetadata> = {
  Celtics: {
    name: "Celtics",
    emoji: "🏀",
    fullName: "Boston Celtics",
    sport: "NBA Basketball",
    venue: "TD Garden",
    venueCoords: [42.3662, -71.0621],
    bio: "18 championships and counting. The Celtics are the most decorated franchise in NBA history and the standard by which Boston basketball is measured. Banner 18 went up in 2024. The Garden — still called that — is one of the loudest arenas in basketball.",
    championships: ["2024", "2008", "1986", "1984", "1981", "1976", "1974", "1969", "1968", "1966", "1965", "1964", "1963", "1962", "1961", "1960", "1959", "1957"],
    scheduleUrl: "https://www.nba.com/celtics/schedule",
    founded: 1946,
    colors: "Green & White",
  },
  Bruins: {
    name: "Bruins",
    emoji: "🏒",
    fullName: "Boston Bruins",
    sport: "NHL Hockey",
    venue: "TD Garden",
    venueCoords: [42.3662, -71.0621],
    bio: "Original Six. The Bruins have been playing hockey in Boston since 1924 and the building on Causeway Street has been the center of it. The 2011 Cup run ended a 39-year drought and nearly took the roof off the city. Spoked B, black and gold, Bobby Orr flying through the air.",
    championships: ["2011", "1972", "1970", "1941", "1939", "1929"],
    scheduleUrl: "https://www.nhl.com/bruins/schedule",
    founded: 1924,
    colors: "Black & Gold",
  },
  "Red Sox": {
    name: "Red Sox",
    emoji: "⚾",
    fullName: "Boston Red Sox",
    sport: "MLB Baseball",
    venue: "Fenway Park",
    venueCoords: [42.3467, -71.0972],
    bio: "Fenway Park opened in 1912 and it's still the best place to watch a baseball game. The Green Monster, Pesky's Pole, the manual scoreboard. 2004 broke the curse — reverse sweep against the Yankees in the ALCS, then a World Series that made grown adults weep in the street. Three more titles since. Sweet Caroline in the 8th.",
    championships: ["2018", "2013", "2007", "2004", "1918", "1916", "1915", "1912", "1903"],
    scheduleUrl: "https://www.mlb.com/red-sox/schedule",
    founded: 1901,
    colors: "Red, White & Blue",
  },
  Patriots: {
    name: "Patriots",
    emoji: "🏈",
    fullName: "New England Patriots",
    sport: "NFL Football",
    venue: "Gillette Stadium",
    venueCoords: [42.0909, -71.2643],
    bio: "Six Super Bowls in 20 years changed the way the rest of the country thinks about New England. The dynasty is over, the rebuild is real, and the fans are impatient because they remember what greatness looked like. Gillette is in Foxborough, 35 miles south. The tailgate is the thing.",
    championships: ["2018", "2016", "2014", "2004", "2003", "2001"],
    scheduleUrl: "https://www.patriots.com/schedule",
    founded: 1959,
    colors: "Navy, Red, Silver & White",
  },
  Revolution: {
    name: "Revolution",
    emoji: "⚽",
    fullName: "New England Revolution",
    sport: "MLS Soccer",
    venue: "Gillette Stadium",
    venueCoords: [42.0909, -71.2643],
    bio: "The Revolution have been playing MLS soccer since 1996 and sharing Gillette Stadium with the Patriots the whole time. Five MLS Cup finals, zero wins — the heartbreak is consistent. The supporters section is real. The stadium is too big for the crowds but the energy in the right section makes up for it.",
    championships: [],
    scheduleUrl: "https://www.revolutionsoccer.net/schedule",
    founded: 1995,
    colors: "Blue & Red",
  },
  Fleet: {
    name: "Fleet",
    emoji: "⛵",
    fullName: "Boston Fleet (PWHL)",
    sport: "Professional Women's Hockey",
    venue: "Tsongas Center",
    venueCoords: [42.6492, -71.3120],
    bio: "Boston's PWHL franchise — professional women's hockey at its best. The PWHL launched in 2024 and the Fleet are part of the league's first generation. Tsongas Center crowds are loud and the games are fast.",
    championships: [],
    scheduleUrl: "https://www.thepwhl.com/en/teams/boston-fleet/schedule-25-26",
    founded: 2023,
    colors: "Green & Gold",
  },
  "Free Jacks": {
    name: "Free Jacks",
    emoji: "🏉",
    fullName: "New England Free Jacks",
    sport: "Major League Rugby",
    venue: "Veterans Memorial Stadium",
    venueCoords: [42.2362, -71.0102],
    bio: "New England's MLR franchise and back-to-back champions. Rugby in Boston is real and growing — Free Jacks home games at Vets are a Quincy ritual. Free Jack Forever.",
    championships: ["2024", "2023", "2022"],
    scheduleUrl: "https://www.freejacks.com/schedule",
    founded: 2018,
    colors: "Navy & Yellow",
  },
  Glory: {
    name: "Glory",
    emoji: "🥏",
    fullName: "Boston Glory",
    sport: "Ultimate Frisbee (UFA)",
    venue: "Hormel Stadium",
    venueCoords: [42.4144, -71.1180],
    bio: "Boston's Ultimate Frisbee Association franchise. Competitive ultimate at the highest level — fast, athletic, and underrated as a sport to watch live.",
    championships: [],
    scheduleUrl: "https://www.watchufa.com/glory/schedule",
    founded: 2020,
    colors: "Black & Gold",
  },
};

export type NonEspnTeam = {
  name: string;
  emoji: string;
  fullName: string;
  sport: string;
  venue: string;
  description: string;
  scheduleUrl: string;
  activeMonths: number[]; // 0-indexed months
};

export const NON_ESPN_TEAMS: NonEspnTeam[] = [
  {
    name: "Fleet",
    emoji: "⛵",
    fullName: "Boston Fleet (PWHL)",
    sport: "Professional Women's Hockey",
    venue: "Tsongas Center",
    description: "Boston's PWHL franchise. Professional women's hockey at its best.",
    scheduleUrl: "https://www.thepwhl.com/en/teams/boston-fleet/schedule-25-26",
    activeMonths: [0, 1, 2, 3, 4], // Jan–May
  },
  {
    name: "Free Jacks",
    emoji: "🏉",
    fullName: "New England Free Jacks",
    sport: "Major League Rugby",
    venue: "Veterans Memorial Stadium",
    description: "New England's MLR franchise and 2022 champions. Rugby in Boston is real and growing.",
    scheduleUrl: "https://www.freejacks.com/schedule",
    activeMonths: [1, 2, 3, 4, 5, 6], // Feb–Jul
  },
  {
    name: "Glory",
    emoji: "🥏",
    fullName: "Boston Glory",
    sport: "Ultimate Frisbee (UFA)",
    venue: "TBD",
    description: "Boston's Ultimate Frisbee Association franchise. Competitive ultimate at the highest level.",
    scheduleUrl: "https://www.watchufa.com/glory/schedule",
    activeMonths: [3, 4, 5, 6, 7, 8], // Apr–Sep
  },
];
