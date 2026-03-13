export interface ActivityBlock {
  id: string;
  timeSlot: "morning" | "afternoon" | "evening" | "rest";
  primary: {
    name: string;
    type: string;
    description: string;
    whyForYou: string;
    costRange: string;
    imageUrl: string;
    lat: number;
    lng: number;
  };
  backup: {
    name: string;
    costRange: string;
    imageUrl?: string;
    description?: string;
    whyForYou?: string;
    type?: string;
  };
  groupAttribution: string[];
  curatorName?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  blocks: ActivityBlock[];
}

export interface Itinerary {
  id: string;
  destination: string;
  country: string;
  durationDays: number;
  groupType: "solo" | "couple" | "group";
  participants: string[];
  days: ItineraryDay[];
}

export interface CuratedEscape {
  id: string;
  destination: string;
  country: string;
  tagline: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  pricePerDay: number;
  lat: number;
  lng: number;
  tags: string[];
}

export interface SurveyPreferences {
  energy: string;
  budget: string;
  activities: string[];
  food: string;
}

export interface SurveyParticipant {
  id: string;
  name: string;
  email?: string;
  completedAt?: string;
  status: "completed" | "pending";
  preferences?: SurveyPreferences;
}

export const STOCK_IMAGES: Record<string, string> = {
  "vancouver-hero": "https://images.unsplash.com/photo-1560814304-4f05b62af116?w=1600&q=85",
  "toronto-hero": "https://images.unsplash.com/photo-1517090186835-e348b621c9ca?w=1600&q=85",
  "montreal-hero": "https://images.unsplash.com/photo-1519178614-68673b201f36?w=1600&q=85",
  "quebec-hero": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85",
  "calgary-hero": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85",
  "victoria-hero": "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1600&q=85",
  "banff-hero": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=85",
  "cafe": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  "museum": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
  "market": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "restaurant": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "park": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  "gallery": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&q=80",
  "bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "architecture": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  "hotel-rest": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "vancouver-market": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
  "vancouver-gallery": "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80",
  "vancouver-cafe": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
  "vancouver-park": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  "vancouver-bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
};

export const MOCK_ITINERARY: Itinerary = {
  id: "vancouver-2day",
  destination: "Vancouver",
  country: "Canada",
  durationDays: 2,
  groupType: "group",
  participants: [],
  days: [
    {
      dayNumber: 1,
      date: "Apr 18",
      blocks: [
        {
          id: "d1-morning",
          timeSlot: "morning",
          curatorName: "",
          primary: {
            name: "Café Bica",
            type: "Local espresso bar · Gastown",
            description:
              "A narrow, wood-panelled café tucked into the cobblestones of Gastown. The oat flat white is exceptional, and the almond croissants are worth arriving early for.",
            whyForYou:
              "You chose hidden gems + relaxed mornings. This is the kind of place regulars fiercely protect — and now you know about it.",
            costRange: "$10–16",
            imageUrl: STOCK_IMAGES["vancouver-cafe"],
            lat: 49.2827,
            lng: -123.1085,
          },
          backup: { name: "Granville Island Public Market", costRange: "$8–20", imageUrl: STOCK_IMAGES["market"], type: "Indoor market · False Creek", description: "Vancouver's most beloved indoor market — local cheeses, fresh oysters, and artisan everything. Arrive hungry and take your time.", whyForYou: "A slower-paced morning that leans into your love of markets and local finds." },
          groupAttribution: ["Alice", "Bob"],
        },
        {
          id: "d1-afternoon",
          timeSlot: "afternoon",
          curatorName: "",
          primary: {
            name: "Vancouver Art Gallery",
            type: "Art museum · Downtown",
            description:
              "One of Canada's most significant art museums, housed in a grand neoclassical building. The Emily Carr collection alone is worth the afternoon. Quieter on weekday afternoons.",
            whyForYou:
              "Matches your cultural explorer energy — high quality, low walking effort, and the building itself is worth seeing.",
            costRange: "$24–28",
            imageUrl: STOCK_IMAGES["vancouver-gallery"],
            lat: 49.2826,
            lng: -123.1207,
          },
          backup: { name: "Museum of Anthropology (UBC)", costRange: "$18", imageUrl: STOCK_IMAGES["architecture"], type: "World-class museum · UBC Campus", description: "Arthur Erickson's stunning concrete and glass building houses one of the world's finest collections of Northwest Coast Indigenous art. The Great Hall alone is worth the trip.", whyForYou: "Combines your love of architecture and culture — and it's far less crowded than downtown." },
          groupAttribution: ["Alice"],
        },
        {
          id: "d1-evening",
          timeSlot: "evening",
          curatorName: "",
          primary: {
            name: "Burdock & Co",
            type: "West Coast tasting menu · Main St",
            description:
              "One of Vancouver's most celebrated neighbourhood restaurants. Chef Andrea Carlson changes the menu with the season. Intimate room, exceptional wine list, no pretension.",
            whyForYou:
              "You said food IS the trip. This is a James Beard-calibre experience in a room that feels like someone's very good living room.",
            costRange: "$70–100",
            imageUrl: STOCK_IMAGES["restaurant"],
            lat: 49.2628,
            lng: -123.1011,
          },
          backup: { name: "Ask for Luigi", costRange: "$40–60", imageUrl: STOCK_IMAGES["cafe"], type: "Italian pasta bar · Gastown", description: "A tiny, warm pasta bar that's earned a near-mythic reputation in Vancouver. The handmade pastas change weekly, the room is always buzzing, and the waiting list is worth it.", whyForYou: "A slightly more relaxed take on a special dinner — same exceptional quality, more convivial energy." },
          groupAttribution: ["Alice", "Bob"],
        },
      ],
    },
    {
      dayNumber: 2,
      date: "Apr 19",
      blocks: [
        {
          id: "d2-morning",
          timeSlot: "morning",
          curatorName: "",
          primary: {
            name: "Granville Island Public Market",
            type: "Indoor market · False Creek",
            description:
              "Vancouver's most beloved market — artisan cheeses, fresh oysters, smoked salmon, and charcuterie from some of BC's best producers. Arrive hungry, leave with provisions.",
            whyForYou:
              "You both picked markets & hidden gems. This is locals' Saturday morning ritual — still lively enough to feel alive, small enough to feel personal.",
            costRange: "Free to browse",
            imageUrl: STOCK_IMAGES["vancouver-market"],
            lat: 49.2711,
            lng: -123.1344,
          },
          backup: { name: "Trout Lake Farmers Market", costRange: "Free", imageUrl: STOCK_IMAGES["park"], type: "Outdoor farmers market · East Vancouver", description: "A neighbourhood Saturday ritual on the edge of a peaceful urban park. Less tourist-facing than Granville Island — this is where East Van locals actually shop.", whyForYou: "Quieter, greener, and genuinely local. Perfect if you want the market feel without the crowds." },
          groupAttribution: ["Bob"],
        },
        {
          id: "d2-rest",
          timeSlot: "rest",
          curatorName: "",
          primary: {
            name: "Downtime at Hotel",
            type: "Rest & recharge",
            description:
              "Take a breather. Freshen up, grab a coffee, or just decompress before the evening. No agenda — this time is yours.",
            whyForYou: "You mentioned wanting space to breathe. This is built in so you arrive at dinner feeling restored.",
            costRange: "Free",
            imageUrl: STOCK_IMAGES["hotel-rest"],
            lat: 49.2827,
            lng: -123.1207,
          },
          backup: { name: "", costRange: "" },
          groupAttribution: ["Alice", "Bob"],
        },
        {
          id: "d2-evening",
          timeSlot: "evening",
          curatorName: "",
          primary: {
            name: "The Diamond",
            type: "Craft cocktail bar · Gastown",
            description:
              "Three floors above Gastown's cobblestone streets, The Diamond makes some of the finest cocktails in Canada. Dimly lit, beautifully stocked, and never too loud to have a conversation.",
            whyForYou:
              "You both picked culture + atmosphere. This is where Vancouver's creative set ends a good weekend — and you deserve a good weekend.",
            costRange: "$18–28",
            imageUrl: STOCK_IMAGES["vancouver-bar"],
            lat: 49.2837,
            lng: -123.1063,
          },
          backup: { name: "Juniper Kitchen & Bar", costRange: "$15–22", imageUrl: STOCK_IMAGES["restaurant"], type: "Pacific Northwest bar & kitchen · Downtown", description: "A warmly lit room in the heart of downtown with an outstanding natural wine list and small plates built around BC ingredients. Quieter than Gastown and just as good.", whyForYou: "Same elevated atmosphere, different vibe — this one feels more like a locals-in-the-know dinner." },
          groupAttribution: ["Alice", "Bob"],
        },
      ],
    },
  ],
};

export const CURATED_ESCAPES: CuratedEscape[] = [
  {
    id: "vancouver",
    destination: "Vancouver",
    country: "Canada",
    tagline: "Ocean, mountains & market mornings",
    description: "Two days of Gastown charm, waterfront walks, and exceptional Pacific Northwest dining.",
    imageUrl: STOCK_IMAGES["vancouver-hero"],
    startDate: "Apr 18",
    endDate: "Apr 20",
    durationDays: 3,
    pricePerDay: 130,
    lat: 49.2827,
    lng: -123.1207,
    tags: ["Nature", "Culture", "Dining"],
  },
  {
    id: "toronto",
    destination: "Toronto",
    country: "Canada",
    tagline: "Neighbourhoods, galleries & rooftop bars",
    description: "Three days exploring Kensington Market, the AGO, and Ossington's vibrant dining strip.",
    imageUrl: STOCK_IMAGES["toronto-hero"],
    startDate: "May 9",
    endDate: "May 11",
    durationDays: 3,
    pricePerDay: 120,
    lat: 43.6532,
    lng: -79.3832,
    tags: ["Culture", "Dining", "History"],
  },
  {
    id: "montreal",
    destination: "Montréal",
    country: "Canada",
    tagline: "Old world charm meets electric food scene",
    description: "Two days in the Plateau, Old Port, and the most underrated restaurant city in North America.",
    imageUrl: STOCK_IMAGES["montreal-hero"],
    startDate: "Jun 6",
    endDate: "Jun 7",
    durationDays: 2,
    pricePerDay: 100,
    lat: 45.5017,
    lng: -73.5673,
    tags: ["Dining", "Culture", "History"],
  },
  {
    id: "quebec",
    destination: "Québec City",
    country: "Canada",
    tagline: "Cobblestones, history & winter warmth",
    description: "Two days inside the only walled city in North America — pure European magic, no passport needed.",
    imageUrl: STOCK_IMAGES["quebec-hero"],
    startDate: "Mar 28",
    endDate: "Mar 29",
    durationDays: 2,
    pricePerDay: 95,
    lat: 46.8139,
    lng: -71.2080,
    tags: ["History", "Culture", "Relaxation"],
  },
  {
    id: "banff",
    destination: "Banff",
    country: "Canada",
    tagline: "Glaciers, hot springs & pure wilderness",
    description: "Three days in Canada's most spectacular national park — turquoise lakes included.",
    imageUrl: STOCK_IMAGES["banff-hero"],
    startDate: "Jul 12",
    endDate: "Jul 14",
    durationDays: 3,
    pricePerDay: 150,
    lat: 51.1784,
    lng: -115.5708,
    tags: ["Nature", "Adventure", "Relaxation"],
  },
  {
    id: "victoria",
    destination: "Victoria",
    country: "Canada",
    tagline: "Gardens, whale watching & afternoon tea",
    description: "Two days on Vancouver Island — the most surprisingly charming city in Canada.",
    imageUrl: STOCK_IMAGES["victoria-hero"],
    startDate: "Apr 5",
    endDate: "Apr 6",
    durationDays: 2,
    pricePerDay: 110,
    lat: 48.4284,
    lng: -123.3656,
    tags: ["Nature", "Relaxation", "Culture"],
  },
];

export type TripStatus = "upcoming" | "past" | "draft";

export interface SavedTrip {
  id: string;
  destination: string;
  country: string;
  tagline: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  groupType: "solo" | "duo" | "group" | "family";
  companions?: string[];
  status: TripStatus;
  itineraryId: string;
}

export const MOCK_SAVED_TRIPS: SavedTrip[] = [
  {
    id: "saved-vancouver",
    destination: "Vancouver",
    country: "Canada",
    tagline: "Ocean, mountains & market mornings",
    imageUrl: STOCK_IMAGES["vancouver-hero"],
    startDate: "Apr 18",
    endDate: "Apr 19",
    durationDays: 2,
    groupType: "group",
    companions: ["Alice", "Bob", "Charlie"],
    status: "upcoming",
    itineraryId: "vancouver-2day",
  },
  {
    id: "saved-banff",
    destination: "Banff",
    country: "Canada",
    tagline: "Glaciers, hot springs & pure wilderness",
    imageUrl: STOCK_IMAGES["banff-hero"],
    startDate: "Feb 14",
    endDate: "Feb 16",
    durationDays: 3,
    groupType: "duo",
    companions: ["Jordan"],
    status: "past",
    itineraryId: "vancouver-2day",
  },
  {
    id: "saved-montreal",
    destination: "Montréal",
    country: "Canada",
    tagline: "Old world charm meets electric food scene",
    imageUrl: STOCK_IMAGES["montreal-hero"],
    startDate: "Jan 10",
    endDate: "Jan 11",
    durationDays: 2,
    groupType: "solo",
    status: "past",
    itineraryId: "vancouver-2day",
  },
  {
    id: "draft-quebec",
    destination: "Québec City",
    country: "Canada",
    tagline: "Cobblestones, history & winter warmth",
    imageUrl: STOCK_IMAGES["quebec-hero"],
    startDate: "—",
    endDate: "—",
    durationDays: 2,
    groupType: "duo",
    companions: ["Sam"],
    status: "draft",
    itineraryId: "vancouver-2day",
  },
];

export const MOCK_PARTICIPANTS: SurveyParticipant[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@example.com",
    completedAt: "2h ago",
    status: "completed",
    preferences: {
      energy: "Relaxed pace",
      budget: "$200–350",
      activities: ["Hidden gems", "Markets & shopping", "Wellness & spas"],
      food: "Food IS the trip",
    },
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@example.com",
    completedAt: "45 min ago",
    status: "completed",
    preferences: {
      energy: "Balanced mix",
      budget: "$100–200",
      activities: ["Iconic landmarks", "Architecture", "Nature & parks"],
      food: "Great meals, won't rearrange",
    },
  },
  {
    id: "3",
    name: "Charlie",
    status: "pending",
  },
];
