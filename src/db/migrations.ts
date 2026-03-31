import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/neynar-db-sdk/db";
import { spots } from "@/db/schema";

/**
 * Schema migrations — runs automatically on server startup via instrumentation.ts
 * Creates ALL tables from scratch (safe on existing DBs via IF NOT EXISTS),
 * then auto-seeds 63 curated spots if the spots table is empty.
 */

const GENUINEJACK_FID = 218957;
const GENUINEJACK_PFP =
  "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/533a424d-d6f8-4c6a-30ec-7658555db700/original";

const SEED_SPOTS = [
  { id: "03baac4a-aedb-42c0-9b71-6008fa6b3ff4", name: "Sarma", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Cambridge / Somerville", description: "Turkish meyhane that's been booking up for a decade. The lentil nachos are not a joke.", address: "249 Pearl St, Somerville, MA 02145", latitude: 42.3798, longitude: -71.097, link: "https://www.sarmarestaurant.com", featured: true },
  { id: "cd4d7d24-8b26-424f-967b-c75968e38360", name: "Brassica Kitchen + Café", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Jamaica Plain", description: "Farm-to-table that actually means it. The vegetable dishes outshine the proteins.", address: "3710 Washington St, Jamaica Plain, MA 02130", latitude: 42.3118, longitude: -71.106, link: "https://www.brassicakitchen.com", featured: false },
  { id: "3f922fc3-cc49-4897-8931-d88d2daeb36c", name: "Row 34", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Seaport", description: "The raw bar is elite and the beer list is deep. Skip the tourist traps, come here.", address: "383 Congress St, Boston, MA 02210", latitude: 42.3512, longitude: -71.0511, link: "https://www.row34.com", featured: true },
  { id: "d5e10c8d-ea81-40ab-870a-4169c40b5ee5", name: "Neptune Oyster", category: "Food & Drink", subcategory: "Lunch", neighborhood: "North End", description: "Tiny, no reservations, worth the wait. The lobster roll debate starts and ends here.", address: "63 Salem St, Boston, MA 02113", latitude: 42.3636, longitude: -71.0551, link: "https://www.neptuneoyster.com", featured: true },
  { id: "f79638e8-e820-48b4-9bde-9513c1faf8d0", name: "Toro", category: "Food & Drink", subcategory: "Dinner", neighborhood: "South End", description: "Barcelona-style tapas in the South End. The corn with aioli is a religion.", address: "1704 Washington St, Boston, MA 02118", latitude: 42.3388, longitude: -71.0756, link: "https://www.toro-restaurant.com", featured: false },
  { id: "7cfb9395-bbdf-4dc1-9584-a47e85a23cff", name: "Szechuan Mountain House", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Allston / Brighton", description: "Best of Boston winner and it's earned. The dan dan noodles will ruin you for all others.", address: "238 Harvard Ave, Allston, MA 02134", latitude: 42.3527, longitude: -71.1313, link: "https://www.instagram.com/szechuanmountainhouse", featured: false },
  { id: "396675bc-9458-4a11-9403-3eb2be3da372", name: "Pho Hoa", category: "Food & Drink", subcategory: "Lunch", neighborhood: "Dorchester", description: "Cash only, no frills, best pho in Boston. Dot Ave knows.", address: "1356 Dorchester Ave, Dorchester, MA 02122", latitude: 42.2919, longitude: -71.0594, link: "https://www.instagram.com/phohoaboston", featured: false },
  { id: "25e1fdb9-27c9-4944-99a1-0ffe4feecaeb", name: "Cunard Tavern", category: "Food & Drink", subcategory: "Dinner", neighborhood: "East Boston", description: "Neighborhood restaurant punching way above its weight. The burger is perfect.", address: "24 Orleans St, East Boston, MA 02128", latitude: 42.3702, longitude: -71.0388, link: "https://www.cunardtavern.com", featured: false },
  { id: "b1ffb207-dc3f-4b86-83e6-b4f703918249", name: "Zurito", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Beacon Hill", description: "Basque pinxtos on the Hill. Sea urchin toast and a glass of txakoli. That's the move.", address: "73 Charles St, Boston, MA 02114", latitude: 42.3588, longitude: -71.0707, link: "https://www.zuritoboston.com", featured: true },
  { id: "ce15464c-3070-47c5-a3fd-1a693d82ec56", name: "Mamma Maria", category: "Food & Drink", subcategory: "Dinner", neighborhood: "North End", description: "Upstairs on North Square, views of the church. The most romantic dinner in the North End.", address: "3 North Square, Boston, MA 02113", latitude: 42.3635, longitude: -71.0545, link: "https://www.mammamaria.com", featured: false },
  { id: "4d1e825e-9005-40e3-9f9c-f97c4b107281", name: "Myers + Chang", category: "Food & Drink", subcategory: "Dinner", neighborhood: "South End", description: "Asian-inspired small plates that don't try to be authentic. They try to be delicious. They are.", address: "1145 Washington St, Boston, MA 02118", latitude: 42.3438, longitude: -71.0673, link: "https://www.myersandchang.com", featured: false },
  { id: "1c31dc7b-caac-4c3c-95ba-0bb441ecd1c5", name: "The Daily Catch", category: "Food & Drink", subcategory: "Lunch", neighborhood: "North End", description: "Sicilian seafood served in the pan it was cooked in. Seven tables. No substitutions.", address: "323 Hanover St, Boston, MA 02113", latitude: 42.3647, longitude: -71.0535, link: "https://www.thedailycatch.com", featured: false },
  { id: "63d55eac-1249-4760-aec8-fd8b4cbe3db1", name: "Kaia", category: "Food & Drink", subcategory: "Dinner", neighborhood: "South End", description: "Coastal Greek in the South End. Condé Nast named it a reason to visit Boston. They're right.", address: "1 Huntington Ave, Boston, MA 02116", latitude: 42.3477, longitude: -71.0769, link: "https://www.kaiasouthend.com", featured: true },
  { id: "d5cad8cb-d6ff-48ae-85ab-7680a9804ba0", name: "Celeste", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Cambridge / Somerville", description: "Peruvian food good enough to put Somerville on a national food list. The ceviche is unreal.", address: "21 Bow St, Somerville, MA 02143", latitude: 42.3803, longitude: -71.0882, link: "https://www.celesteunionsquare.com", featured: false },
  { id: "82bacf2a-a408-4d3b-b7ff-bdb8c11fff4b", name: "Tatte Bakery", category: "Food & Drink", subcategory: "Breakfast", neighborhood: "Back Bay", description: "Israeli-meets-Parisian bakery that took over Boston. The shakshuka is the move.", address: "399 Boylston St, Boston, MA 02116", latitude: 42.3524, longitude: -71.0718, link: "https://www.tattebakery.com", featured: false },
  { id: "e45282ff-e936-4ce9-aeeb-4265c041a05f", name: "George Howell Coffee", category: "Coffee", subcategory: null, neighborhood: "Downtown / Financial District", description: "Single-origin pour-overs from the godfather of Boston specialty coffee. Worth the pilgrimage.", address: "505 Washington St, Boston, MA 02111", latitude: 42.354, longitude: -71.0621, link: "https://www.georgehowellcoffee.com", featured: true },
  { id: "0ed71c05-6edd-4e4e-9ce9-867a1393dea8", name: "Gracenote Coffee", category: "Coffee", subcategory: null, neighborhood: "Downtown / Financial District", description: "Standing-room espresso bar in the Leather District. The Alpha blend is the daily driver.", address: "108 Lincoln St, Boston, MA 02111", latitude: 42.3501, longitude: -71.0571, link: "https://www.gracenotecoffee.com", featured: false },
  { id: "772fddc4-7b94-4c2b-a23e-c1a0e23d29aa", name: "Render Coffee", category: "Coffee", subcategory: null, neighborhood: "South End", description: "The atrium seating in back is the best-kept secret. Tandem beans from Portland.", address: "563 Columbus Ave, Boston, MA 02118", latitude: 42.3405, longitude: -71.0814, link: "https://www.rendercoffee.com", featured: false },
  { id: "d7a43662-d27f-4f2d-a310-9732dedc9c3b", name: "Ogawa Coffee", category: "Coffee", subcategory: null, neighborhood: "Downtown / Financial District", description: "Only US location of this Japanese chain. Best latte art in Boston, full stop.", address: "10 Milk St, Boston, MA 02108", latitude: 42.3576, longitude: -71.058, link: "https://www.ogawacoffeeusa.com", featured: false },
  { id: "890d73cf-57dc-45cc-b01a-f76ba6b05ce1", name: "Thinking Cup", category: "Coffee", subcategory: null, neighborhood: "Downtown / Financial District", description: "Boston Globe readers named it #1. Feels like a Parisian café dropped onto Tremont St.", address: "165 Tremont St, Boston, MA 02111", latitude: 42.3536, longitude: -71.0634, link: "https://www.thinkingcup.com", featured: false },
  { id: "6977eb02-3b23-4371-bda4-a9eaf42479f2", name: "Caffè Vittoria", category: "Coffee", subcategory: null, neighborhood: "North End", description: "Oldest Italian café in Boston. Lavazza cappuccinos and old espresso machines on the walls.", address: "290-296 Hanover St, Boston, MA 02113", latitude: 42.3644, longitude: -71.0532, link: "https://www.caffevittoria.com", featured: false },
  { id: "1334112a-fc03-4922-817a-be02ba3d5dcc", name: "South End Buttery", category: "Coffee", subcategory: null, neighborhood: "South End", description: "The vibes alone justify the rec. House-made syrups, good bagels, charming as hell.", address: "314 Shawmut Ave, Boston, MA 02118", latitude: 42.3421, longitude: -71.0728, link: "https://www.southendbuttery.com", featured: false },
  { id: "c1ab0536-9f28-4362-83b0-47ee42dcdde5", name: "Backbar", category: "Nightlife", subcategory: null, neighborhood: "Cambridge / Somerville", description: "Hidden behind an alley in Union Square. 39 seats, rotating cocktails, worth the detour.", address: "7 Sanborn Ct, Somerville, MA 02143", latitude: 42.3791, longitude: -71.0937, link: "https://www.backbarunion.com", featured: true },
  { id: "b2029994-0db2-4d5a-910f-e8afd941bdb3", name: "Yvonne's", category: "Nightlife", subcategory: null, neighborhood: "Downtown / Financial District", description: "Enter through a fake hair salon. Library bar with mahogany everything. Your check comes in a book.", address: "2 Winter Pl, Boston, MA 02108", latitude: 42.3556, longitude: -71.0607, link: "https://www.yvonnesboston.com", featured: true },
  { id: "67dc1d9b-de5e-406e-a505-06fc9e2c36ab", name: "The Beehive", category: "Nightlife", subcategory: null, neighborhood: "South End", description: "Jazz, world music, and smoked Turkish pepper wings in a basement. Boston's best live-music bar.", address: "541 Tremont St, Boston, MA 02116", latitude: 42.3436, longitude: -71.0742, link: "https://www.beehiveboston.com", featured: false },
  { id: "418e2b4b-cbc8-4d40-90c1-be5f489c4a9b", name: "Carrie Nation", category: "Nightlife", subcategory: null, neighborhood: "Beacon Hill", description: "Prohibition-themed cocktails steps from the State House. Find the hidden speakeasy upstairs.", address: "11 Beacon St, Boston, MA 02108", latitude: 42.3581, longitude: -71.0627, link: "https://www.carrienationboston.com", featured: false },
  { id: "d350b0ae-9595-40ab-940b-ccc7b0073a2e", name: "The Cantab Lounge", category: "Nightlife", subcategory: null, neighborhood: "Cambridge / Somerville", description: "Live music seven nights a week. Cheap beers. Diverse crowd. Long live the Cantab.", address: "738 Massachusetts Ave, Cambridge, MA 02139", latitude: 42.3658, longitude: -71.1032, link: "https://www.thecantablounge.com", featured: false },
  { id: "2ee437a1-5d38-4ca2-b0ef-3e66a6a14c9a", name: "89 Charles", category: "Nightlife", subcategory: null, neighborhood: "Beacon Hill", description: "Subterranean Art Deco cocktail bar. Beacon Hill finally got a serious drinks spot.", address: "89 Charles St, Boston, MA 02114", latitude: 42.3593, longitude: -71.0714, link: "https://www.instagram.com/89charlesst", featured: false },
  { id: "241d4bb5-cf44-4bfc-a625-5618b34ec7b4", name: "Club Café", category: "Nightlife", subcategory: null, neighborhood: "South End", description: "40 years as the gathering space for LGBTQ+ Boston. Piano bar, restaurant, dance floor.", address: "209 Columbus Ave, Boston, MA 02116", latitude: 42.3454, longitude: -71.0726, link: "https://www.clubcafe.com", featured: false },
  { id: "f9fc86d5-151f-4c48-9efd-4fee0db610ae", name: "Tall Ship", category: "Nightlife", subcategory: null, neighborhood: "East Boston", description: "Speakeasy raw bar hidden behind Pazza on Porter. Caviar and cocktails through a curtain.", address: "107 Porter St, East Boston, MA 02128", latitude: 42.3751, longitude: -71.0351, link: "https://www.instagram.com/tallshipeastie", featured: false },
  { id: "4cc21c61-70ba-4433-a503-418f049d1ffc", name: "Arnold Arboretum", category: "Outdoors", subcategory: null, neighborhood: "Jamaica Plain", description: "265 acres of Harvard-maintained trees. The lilac collection in May is non-negotiable.", address: "125 Arborway, Jamaica Plain, MA 02130", latitude: 42.3003, longitude: -71.1246, link: "https://arboretum.harvard.edu", featured: true },
  { id: "eac28729-5066-4eb9-b562-45494aec4195", name: "Castle Island", category: "Outdoors", subcategory: null, neighborhood: "South Boston", description: "Walk the loop, get a hot dog at Sully's, watch the planes. Southie's front yard.", address: "2010 William J Day Blvd, South Boston, MA 02127", latitude: 42.338, longitude: -71.0106, link: "https://www.mass.gov/locations/castle-island-pleasure-bay-m-street-beach-and-carson-beach", featured: true },
  { id: "efc26810-9d2f-45ab-af22-7aa8337c2512", name: "Esplanade", category: "Outdoors", subcategory: null, neighborhood: "Back Bay", description: "Run the river, watch the sailboats, sit on a bench. The best free thing in the city.", address: "Along the Charles River, Boston, MA 02116", latitude: 42.3555, longitude: -71.0784, link: "https://esplanade.org", featured: false },
  { id: "a2408b4f-1f30-45d7-b647-ae781b861144", name: "Boston Common & Public Garden", category: "Outdoors", subcategory: null, neighborhood: "Beacon Hill", description: "Swan boats, Make Way for Ducklings, oldest public park in America. Still earns it.", address: "139 Tremont St, Boston, MA 02111", latitude: 42.355, longitude: -71.0655, link: "https://www.boston.gov/parks/boston-common", featured: false },
  { id: "34d8d1c8-a025-4ac0-96b0-3bf229ae8bd9", name: "Piers Park", category: "Outdoors", subcategory: null, neighborhood: "East Boston", description: "Harbor views for free. The skyline from here is better than the Seaport views that cost you.", address: "95 Marginal St, East Boston, MA 02128", latitude: 42.3693, longitude: -71.0346, link: "https://www.piersparkboston.org", featured: false },
  { id: "b7f87346-487d-455f-8ef0-fe969233cd27", name: "Fresh Pond Reservation", category: "Outdoors", subcategory: null, neighborhood: "Cambridge / Somerville", description: "2.25-mile loop around the reservoir. Flat, shaded, dog-friendly. Cambridge's best run.", address: "250 Fresh Pond Pkwy, Cambridge, MA 02138", latitude: 42.3846, longitude: -71.1488, link: "https://www.cambridgema.gov/iwant/freshpondreservation", featured: false },
  { id: "ff7f22e0-bc61-45a7-a64f-e449e13d2459", name: "Institute of Contemporary Art", category: "Culture", subcategory: null, neighborhood: "Seaport", description: "The building alone is worth the trip. The harbor-facing mediatheque is free and stunning.", address: "25 Harbor Shore Dr, Boston, MA 02210", latitude: 42.3521, longitude: -71.0428, link: "https://www.icaboston.org", featured: true },
  { id: "2922e181-f9c5-4515-9510-7e457019c071", name: "Isabella Stewart Gardner Museum", category: "Culture", subcategory: null, neighborhood: "Fenway / Kenmore", description: "Venetian palazzo filled with art and an unsolved heist. The courtyard changes every season.", address: "25 Evans Way, Boston, MA 02115", latitude: 42.3382, longitude: -71.099, link: "https://www.gardnermuseum.org", featured: true },
  { id: "308da953-26c3-4a3b-9d58-46aa7b74e268", name: "Museum of Fine Arts", category: "Culture", subcategory: null, neighborhood: "Fenway / Kenmore", description: "One of the largest art museums in the country and it's never as crowded as it should be.", address: "465 Huntington Ave, Boston, MA 02115", latitude: 42.3394, longitude: -71.094, link: "https://www.mfa.org", featured: false },
  { id: "42723260-d6ad-4847-8fea-7912faeab579", name: "Brattle Theatre", category: "Culture", subcategory: null, neighborhood: "Cambridge / Somerville", description: "Independent cinema since 1953. The kind of movie theater that makes you care about movies.", address: "40 Brattle St, Cambridge, MA 02138", latitude: 42.3733, longitude: -71.1203, link: "https://www.brattlefilm.org", featured: false },
  { id: "b83d3830-a429-4c77-a23a-e45e4da39c59", name: "Coolidge Corner Theatre", category: "Culture", subcategory: null, neighborhood: "Brookline", description: "Art deco gem. Best movie theater in Greater Boston and it's not close.", address: "290 Harvard St, Brookline, MA 02446", latitude: 42.3421, longitude: -71.1228, link: "https://www.coolidge.org", featured: false },
  { id: "df11958e-8b4a-4c23-b5e1-58076b02823c", name: "SoWa Open Market", category: "Shopping", subcategory: null, neighborhood: "South End", description: "Sunday market. Local artists, vintage, food trucks. The South End at its most alive.", address: "460 Harrison Ave, Boston, MA 02118", latitude: 42.3428, longitude: -71.0665, link: "https://www.sowaboston.com", featured: true },
  { id: "06da5182-8858-4d63-9888-1cd9e0746628", name: "Newbury Street", category: "Shopping", subcategory: null, neighborhood: "Back Bay", description: "Eight blocks from fancy to funky. Start at the Public Garden end, walk toward Mass Ave.", address: "Newbury St, Boston, MA 02116", latitude: 42.351, longitude: -71.0764, link: "https://www.newbury-st.com", featured: false },
  { id: "504d0e1b-4a9a-4f69-bd64-845a40c92597", name: "Harvard Book Store", category: "Shopping", subcategory: null, neighborhood: "Cambridge / Somerville", description: "Independent since 1932. The basement bargain books section is dangerous for your wallet.", address: "1256 Massachusetts Ave, Cambridge, MA 02138", latitude: 42.3722, longitude: -71.1164, link: "https://www.harvard.com", featured: false },
  { id: "1bd0ed5c-62eb-49db-8709-30e0bd51cc76", name: "Boston Public Library", category: "Services", subcategory: null, neighborhood: "Back Bay", description: "Free. Beautiful. The Bates Hall reading room will make you want to write a novel.", address: "700 Boylston St, Boston, MA 02116", latitude: 42.3493, longitude: -71.0779, link: "https://www.bpl.org", featured: true },
  { id: "ecda3024-373d-427c-807f-0b52f21b107b", name: "Mapparium", category: "Hidden Gems", subcategory: null, neighborhood: "Fenway / Kenmore", description: "Walk inside a three-story stained glass globe from 1935. Whisper at one end, hear it at the other.", address: "200 Massachusetts Ave, Boston, MA 02115", latitude: 42.3441, longitude: -71.0867, link: "https://www.marybakereddylibrary.org/project/mapparium", featured: true },
  { id: "968afbd6-e6cd-439b-a4a8-76d858899ec2", name: "Ether Dome", category: "Hidden Gems", subcategory: null, neighborhood: "Beacon Hill", description: "Where anesthesia was first used in surgery. Mass General lets you walk in. Most people don't know.", address: "55 Fruit St, Boston, MA 02114", latitude: 42.3633, longitude: -71.0692, link: "https://www.massgeneral.org/museum/exhibits/ether-dome", featured: false },
  { id: "0d9e270e-6ebe-441d-9e86-debdff657375", name: "Sam Adams Brewery", category: "Hidden Gems", subcategory: null, neighborhood: "Jamaica Plain", description: "Free tours, free tastings. The original JP brewery is still the best brewery tour in the city.", address: "30 Germania St, Jamaica Plain, MA 02130", latitude: 42.3139, longitude: -71.1036, link: "https://www.samueladams.com/brewery-experiences/boston", featured: false },
  { id: "a1663de9-ec33-4d28-a832-098ca75a0798", name: "Flour Bakery", category: "Hidden Gems", subcategory: null, neighborhood: "South End", description: "The sticky buns won a James Beard award. Get there early or get in line.", address: "1595 Washington St, Boston, MA 02118", latitude: 42.3377, longitude: -71.076, link: "https://www.flourbakery.com", featured: false },
  { id: "rox-001-haley-house", name: "Haley House Bakery Café", category: "Food & Drink", subcategory: "Breakfast", neighborhood: "Roxbury", description: "A worker-owned bakery and café that's been anchoring Lower Roxbury for thirty years. The breakfast sandwiches are good. The community programs are better. One of the few spots in the city where the mission and the food are equally worth showing up for.", address: "12 Dade St, Roxbury, MA 02119", latitude: 42.3291, longitude: -71.0806, link: "https://haleyhouse.org", featured: false },
  { id: "rox-002-nubian-square", name: "Nubian Square", category: "Culture", subcategory: null, neighborhood: "Roxbury", description: "The center of Roxbury — transit hub, weekend market, and the unofficial capital of Black Boston. The Dudley Café nearby. The square itself is more interesting than any single destination in it.", address: "Dudley St & Warren St, Roxbury, MA 02119", latitude: 42.3302, longitude: -71.0832, link: null, featured: false },
  { id: "rox-003-olmsted-site", name: "Frederick Law Olmsted National Historic Site", category: "Culture", subcategory: null, neighborhood: "Roxbury", description: "The home and office of the man who designed every park you've ever loved in this city. Free. Undervisited. The Emerald Necklace starts making more sense when you see where it was planned.", address: "99 Warren St, Brookline, MA 02445", latitude: 42.3291, longitude: -71.1213, link: "https://www.nps.gov/frla", featured: false },
  { id: "rox-004-el-embajador", name: "El Embajador", category: "Food & Drink", subcategory: "Lunch", neighborhood: "Roxbury", description: "The best Dominican food in Boston. Pernil, mangu, and the kind of rice that makes you understand why Dominican cooking gets discussed separately from Cuban. Cash only, no frills, very much worth it.", address: "Dudley Square area, Roxbury, MA 02119", latitude: 42.3298, longitude: -71.0829, link: null, featured: false },
  { id: "mh-001-penguin-pizza", name: "Penguin Pizza", category: "Food & Drink", subcategory: "Lunch", neighborhood: "Mission Hill", description: "Thin-crust, half-and-half, sold by the slice to Northeastern and MassArt students since forever. One of those places that shouldn't work as well as it does. It just does.", address: "735 Huntington Ave, Mission Hill, MA 02115", latitude: 42.3378, longitude: -71.0985, link: null, featured: false },
  { id: "mh-002-millenium-park", name: "Millenium Park (Mission Hill)", category: "Outdoors", subcategory: null, neighborhood: "Mission Hill", description: "A small park with a big view. Worth the walk up for the skyline shot that doesn't have anyone else's Instagram in front of it.", address: "Bynner St, Mission Hill, MA 02130", latitude: 42.3276, longitude: -71.113, link: null, featured: false },
  { id: "mh-003-brigham-circle", name: "Brigham Circle", category: "Hidden Gems", subcategory: null, neighborhood: "Mission Hill", description: "The neighborhood's unofficial living room. Better coffee, better lunch spots, less foot traffic than the Fenway corridor three blocks north.", address: "Huntington Ave & Francis St, Mission Hill, MA 02115", latitude: 42.3352, longitude: -71.1003, link: null, featured: false },
  { id: "hp-001-stony-brook", name: "Stony Brook Reservation", category: "Outdoors", subcategory: null, neighborhood: "Hyde Park", description: "A thousand acres of woods inside city limits. The hiking trails are good, the trout fishing is decent, and you can genuinely get turned around in here. Bring the dog.", address: "900 West Boundary Rd, Hyde Park, MA 02136", latitude: 42.2564, longitude: -71.1372, link: null, featured: false },
  { id: "hp-002-american-legion", name: "American Legion Highway Corridor", category: "Hidden Gems", subcategory: null, neighborhood: "Hyde Park", description: "Hyde Park's strip of Caribbean and Brazilian restaurants — Haitian, Jamaican, Cape Verdean — that the city's food press hasn't fully caught up to yet. Start at any storefront that has a handwritten menu in the window.", address: "American Legion Hwy, Hyde Park, MA 02136", latitude: 42.255, longitude: -71.1236, link: null, featured: false },
  { id: "roz-001-roslindale-village", name: "Roslindale Village", category: "Hidden Gems", subcategory: null, neighborhood: "Roslindale", description: "The most underrated neighborhood commercial district in Boston. Saturday farmers market from May to November. Real hardware store. Coffee that doesn't have a line. The vibe is: 'we didn't need to be discovered.'", address: "Corinth St area, Roslindale, MA 02131", latitude: 42.2829, longitude: -71.1237, link: null, featured: false },
  { id: "roz-002-wallpaper", name: "Wallpaper", category: "Nightlife", subcategory: null, neighborhood: "Roslindale", description: "A natural wine bar in a former wallpaper store that somehow became one of the best spots in the city. Small, loud, the list is interesting, the food is good. Go on a Tuesday.", address: "South St, Roslindale, MA 02131", latitude: 42.2841, longitude: -71.1218, link: null, featured: false },
  { id: "roz-003-blue-nile", name: "Blue Nile Ethiopian", category: "Food & Drink", subcategory: "Dinner", neighborhood: "Roslindale", description: "Injera, tibs, and proper tej in a no-frills room. One of the best Ethiopian spots in Boston with none of the wait you'll find on the South End's stretch.", address: "Washington St, Roslindale, MA 02131", latitude: 42.2823, longitude: -71.1241, link: null, featured: false },
  { id: "wr-001-centre-street", name: "Centre Street Corridor", category: "Hidden Gems", subcategory: null, neighborhood: "West Roxbury", description: "West Roxbury's main drag has a working Irish-American neighborhood realness that's increasingly rare in Boston. Good butcher shop. A diner that still charges diner prices.", address: "Centre St, West Roxbury, MA 02132", latitude: 42.2773, longitude: -71.1617, link: null, featured: false },
  { id: "wr-002-millennium-park", name: "Millennium Park", category: "Outdoors", subcategory: null, neighborhood: "West Roxbury", description: "The big one — 100 acres of landfill turned park with sweeping views of the city. Kite flying in fall, cross-country skiing in winter, and the best dog park in the Boston parks system.", address: "Gardner St, West Roxbury, MA 02132", latitude: 42.2816, longitude: -71.1766, link: "https://www.boston.gov/parks/millennium-park", featured: false },
  { id: "ns-001-gloucester-harbor", name: "Gloucester Harbor", category: "Outdoors", subcategory: null, neighborhood: "North Shore", description: "A working fishing harbor that hasn't been fully gentrified yet. The fisherman's memorial, the smell of bait in the morning, the boats coming in at dusk. An hour from Boston and a world away from it.", address: "Main St, Gloucester, MA 01930", latitude: 42.6128, longitude: -70.6621, link: null, featured: false },
  { id: "ns-002-turners-seafood", name: "Turner's Seafood", category: "Food & Drink", subcategory: "Lunch", neighborhood: "North Shore", description: "No lobster rolls for tourists — this is the real deal. Counter service, market prices, and fish that was caught this week. Get the haddock chowder.", address: "506 Main St, Gloucester, MA 01930", latitude: 42.6157, longitude: -70.6576, link: "https://www.turnersseafood.com", featured: false },
  { id: "ns-003-salem", name: "Salem", category: "Culture", subcategory: null, neighborhood: "North Shore", description: "October is the obvious answer and the right one — go on a weekday if you can. The Peabody Essex Museum is legitimately world-class and uncrowded in every other month. The Witch Trials memorial is small, serious, and worth sitting with.", address: "Essex St, Salem, MA 01970", latitude: 42.5195, longitude: -70.8967, link: "https://www.salem.org", featured: false },
  { id: "ss-001-duxbury-beach", name: "Duxbury Beach", category: "Outdoors", subcategory: null, neighborhood: "South Shore & Cape", description: "One of the finest barrier beaches in New England and, relative to the Cape, still under the radar. A ten-mile stretch of barrier beach with the best shelling on the South Shore. Worth the drive in September.", address: "Duxbury Beach Rd, Duxbury, MA 02332", latitude: 42.0368, longitude: -70.6448, link: null, featured: false },
  { id: "ss-002-quincy-korean", name: "Quincy Center Restaurant Row", category: "Food & Drink", subcategory: "Dinner", neighborhood: "South Shore & Cape", description: "The Korean and Chinese restaurants around Quincy Center are the real thing — not Chinatown prices, not Chinatown crowds. The strip on Hancock St is where you want to be.", address: "Hancock St, Quincy, MA 02169", latitude: 42.2512, longitude: -71.0025, link: null, featured: false },
] as const;

const CREATE_TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS kv (
    key text PRIMARY KEY,
    value text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS spots (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    subcategory text,
    neighborhood text NOT NULL,
    description text NOT NULL,
    address text,
    link text,
    latitude real,
    longitude real,
    submitted_by_fid integer NOT NULL,
    submitted_by_username text NOT NULL,
    submitted_by_display_name text NOT NULL,
    submitted_by_pfp_url text,
    featured boolean DEFAULT false NOT NULL,
    status text DEFAULT 'approved' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS builders (
    id text PRIMARY KEY,
    fid integer NOT NULL,
    display_name text NOT NULL,
    username text NOT NULL,
    avatar_url text,
    bio text,
    project_name text,
    project_url text,
    neighborhood text,
    category text,
    project_links text,
    categories text,
    talk_about text,
    featured boolean DEFAULT false NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS community_happenings (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    neighborhood text NOT NULL,
    date_label text NOT NULL,
    start_date text,
    end_date text,
    emoji text NOT NULL DEFAULT '📅',
    url text,
    submitted_by_fid integer NOT NULL,
    submitted_by_username text NOT NULL,
    submitted_by_display_name text NOT NULL,
    submitted_by_pfp_url text,
    status text DEFAULT 'approved' NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS submission_errors (
    id text PRIMARY KEY,
    type text NOT NULL,
    payload text NOT NULL,
    error_message text NOT NULL,
    user_fid integer,
    created_at timestamp DEFAULT now() NOT NULL
  )`,
];

const ALTER_MIGRATIONS: string[] = [
  `ALTER TABLE spots ADD COLUMN IF NOT EXISTS link text`,
  `ALTER TABLE spots DROP COLUMN IF EXISTS url`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS bio text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_name text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_url text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS neighborhood text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS category text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS project_links text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS categories text`,
  `ALTER TABLE builders ADD COLUMN IF NOT EXISTS talk_about text`,
  `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS start_date text`,
  `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS end_date text`,
  `ALTER TABLE community_happenings ADD COLUMN IF NOT EXISTS url text`,
  `UPDATE builders SET categories = CONCAT('["', category, '"]') WHERE category IS NOT NULL AND (categories IS NULL OR categories = '')`,
  `UPDATE builders SET project_links = CONCAT('["', project_url, '"]') WHERE project_url IS NOT NULL AND project_url != '' AND (project_links IS NULL OR project_links = '')`,
];

async function runQuery(query: string): Promise<boolean> {
  try {
    await db.execute(sql.raw(query));
    return true;
  } catch (e) {
    console.warn("[migrations] Warning:", (e as Error).message?.slice(0, 120));
    return false;
  }
}

export async function runMigrations() {
  console.log("[migrations] Starting…");
  for (const q of CREATE_TABLES) await runQuery(q);
  for (const q of ALTER_MIGRATIONS) await runQuery(q);
  console.log("[migrations] Schema ready.");
  await autoSeedIfEmpty();
}

async function autoSeedIfEmpty() {
  try {
    const result = await db.execute(sql.raw(`SELECT COUNT(*) as cnt FROM spots`));
    const rows = result as unknown as Array<{ cnt: string | number }>;
    const count = parseInt(String(rows[0]?.cnt ?? "0"), 10);
    if (count > 0) {
      console.log(`[migrations] Spots table has ${count} rows — skipping auto-seed.`);
      return;
    }
    console.log("[migrations] Spots table is empty — seeding…");
    let inserted = 0;
    for (const spot of SEED_SPOTS) {
      try {
        await db.insert(spots).values({
          id: spot.id,
          name: spot.name,
          category: spot.category,
          subcategory: spot.subcategory ?? null,
          neighborhood: spot.neighborhood,
          description: spot.description,
          address: spot.address ?? null,
          link: spot.link ?? null,
          latitude: spot.latitude ?? null,
          longitude: spot.longitude ?? null,
          submittedByFid: GENUINEJACK_FID,
          submittedByUsername: "genuinejack",
          submittedByDisplayName: "Genuine Jack",
          submittedByPfpUrl: GENUINEJACK_PFP,
          featured: spot.featured,
          status: "approved",
        }).onConflictDoNothing({ target: spots.id });
        inserted++;
      } catch (e) {
        console.warn("[migrations] Seed insert failed for", spot.id, (e as Error).message?.slice(0, 80));
      }
    }
    console.log(`[migrations] Auto-seed complete — ${inserted}/${SEED_SPOTS.length} spots inserted.`);
  } catch (e) {
    console.error("[migrations] Auto-seed failed:", e);
  }
}
