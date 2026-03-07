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
  tags: string[];
}

export interface SurveyParticipant {
  id: string;
  name: string;
  email?: string;
  completedAt?: string;
  status: "completed" | "pending";
}

export const STOCK_IMAGES: Record<string, string> = {
  "london-hero": "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1600&q=85",
  "paris-hero": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=85",
  "tokyo-hero": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=85",
  "lisbon-hero": "https://images.unsplash.com/photo-1588169770497-c5c200d50ebb?w=1600&q=85",
  "barcelona-hero": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&q=85",
  "kyoto-hero": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85",
  "cafe": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
  "museum": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
  "market": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  "restaurant": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "park": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  "gallery": "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&q=80",
  "temple": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
  "bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "architecture": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  "hotel-rest": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "london-market": "https://images.unsplash.com/photo-1548143290-b8ece0fbe9b4?w=800&q=80",
  "london-museum": "https://images.unsplash.com/photo-1576541210886-8e2c95fe09bb?w=800&q=80",
  "london-pub": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80",
  "london-cafe": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
  "london-park": "https://images.unsplash.com/photo-1587265104843-bdfb71399f1e?w=800&q=80",
  "london-gallery": "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80",
};

export const MOCK_ITINERARY: Itinerary = {
  id: "london-2day",
  destination: "London",
  country: "United Kingdom",
  durationDays: 2,
  groupType: "group",
  participants: ["Alice", "Bob"],
  days: [
    {
      dayNumber: 1,
      date: "Apr 18",
      blocks: [
        {
          id: "d1-morning",
          timeSlot: "morning",
          curatorName: "Alex's pick",
          primary: {
            name: "Café Lumière",
            type: "Local espresso bar & pastry shop",
            description:
              "A tucked-away café loved by neighbourhood creatives. Try the cardamom croissant and settle into the worn leather chairs — this place moves at its own pace.",
            whyForYou:
              "You chose hidden gems + relaxed mornings. This is exactly the kind of find that doesn't show up on tourist maps.",
            costRange: "$12–18",
            imageUrl: STOCK_IMAGES["london-cafe"],
            lat: 51.5155,
            lng: -0.1411,
          },
          backup: { name: "Borough Farmers Market", costRange: "$8–15" },
          groupAttribution: ["Alice", "Bob"],
        },
        {
          id: "d1-afternoon",
          timeSlot: "afternoon",
          curatorName: "Sarah's pick",
          primary: {
            name: "Tate Modern — Level 4",
            type: "Art gallery · Free entry",
            description:
              "Skip the ground floor crowds. Level 4 has the best rotating exhibits and unobstructed Thames views. Quieter, more considered, and entirely free.",
            whyForYou:
              "Matches your cultural explorer vibe with low walking effort. You can spend as long or as little time as you like.",
            costRange: "Free",
            imageUrl: STOCK_IMAGES["london-gallery"],
            lat: 51.5076,
            lng: -0.0994,
          },
          backup: { name: "Southbank Book Market", costRange: "Free–$20" },
          groupAttribution: ["Alice"],
        },
        {
          id: "d1-evening",
          timeSlot: "evening",
          curatorName: "Everyone",
          primary: {
            name: "Brat Restaurant",
            type: "Wood-fire cooking · Shoreditch",
            description:
              "Named best UK restaurant two years running. The whole turbot is legendary, but the lamb chops are their quiet masterpiece. Book ahead or arrive at 6pm for walk-ins.",
            whyForYou:
              "You said food IS the trip. This is a Michelin-starred experience that doesn't feel stuffy — just extraordinary cooking in a relaxed room.",
            costRange: "$65–90",
            imageUrl: STOCK_IMAGES["restaurant"],
            lat: 51.5246,
            lng: -0.0788,
          },
          backup: { name: "Smoking Goat", costRange: "$35–50" },
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
          curatorName: "Alex's pick",
          primary: {
            name: "Columbia Road Flower Market",
            type: "Street market · Sunday only",
            description:
              "One of London's great sensory experiences. Rows of blooms at impossibly good prices, surrounded by independent shops and the best bagels in the East End.",
            whyForYou:
              "You both picked markets & hidden gems. This one has a genuine neighbourhood feel — very few tourists make it this far east.",
            costRange: "Free to browse",
            imageUrl: STOCK_IMAGES["london-market"],
            lat: 51.5293,
            lng: -0.0784,
          },
          backup: { name: "Brick Lane Sunday Market", costRange: "Free" },
          groupAttribution: ["Bob"],
        },
        {
          id: "d2-rest",
          timeSlot: "rest",
          curatorName: "Everyone",
          primary: {
            name: "Downtime at Hotel",
            type: "Rest & recharge",
            description:
              "Take a breather. Freshen up, grab a coffee, or just decompress before the evening. No agenda — this time is yours.",
            whyForYou: "You said you need to actually decompress. This is built in so you arrive at dinner feeling restored.",
            costRange: "Free",
            imageUrl: STOCK_IMAGES["hotel-rest"],
            lat: 51.513,
            lng: -0.09,
          },
          backup: { name: "", costRange: "" },
          groupAttribution: ["Alice", "Bob"],
        },
        {
          id: "d2-evening",
          timeSlot: "evening",
          curatorName: "Everyone",
          primary: {
            name: "The Prospect of Whitby",
            type: "Historic Thames pub · Est. 1520",
            description:
              "London's oldest riverside pub. Stone floors, low beams, pewter bar — and a terrace that looks directly onto the Thames. Order a proper bitter and watch the river.",
            whyForYou:
              "You both picked culture + history. This pub has been here since Henry VIII — it doesn't get more London than this.",
            costRange: "$15–25",
            imageUrl: STOCK_IMAGES["london-pub"],
            lat: 51.5079,
            lng: -0.057,
          },
          backup: { name: "The Mayflower Pub", costRange: "$12–22" },
          groupAttribution: ["Alice", "Bob"],
        },
      ],
    },
  ],
};

export const CURATED_ESCAPES: CuratedEscape[] = [
  {
    id: "london",
    destination: "London",
    country: "United Kingdom",
    tagline: "Markets, museums & moody pubs",
    description: "Two days of East End charm, world-class galleries, and riverside evenings.",
    imageUrl: STOCK_IMAGES["london-hero"],
    startDate: "Apr 18",
    endDate: "Apr 20",
    durationDays: 3,
    pricePerDay: 120,
    tags: ["Culture", "History", "Dining"],
  },
  {
    id: "paris",
    destination: "Paris",
    country: "France",
    tagline: "Cafés, galleries & golden hour walks",
    description: "Two days of the city at its most quietly beautiful.",
    imageUrl: STOCK_IMAGES["paris-hero"],
    startDate: "May 9",
    endDate: "May 10",
    durationDays: 2,
    pricePerDay: 180,
    tags: ["Romance", "Culture", "Dining"],
  },
  {
    id: "tokyo",
    destination: "Tokyo",
    country: "Japan",
    tagline: "Neon nights & temple mornings",
    description: "Four days navigating the world's most extraordinary city.",
    imageUrl: STOCK_IMAGES["tokyo-hero"],
    startDate: "Mar 28",
    endDate: "Mar 31",
    durationDays: 4,
    pricePerDay: 200,
    tags: ["Adventure", "Culture", "Dining"],
  },
  {
    id: "lisbon",
    destination: "Lisbon",
    country: "Portugal",
    tagline: "Tiles, trams & pastéis de nata",
    description: "Two lazy days in Europe's sunniest capital.",
    imageUrl: STOCK_IMAGES["lisbon-hero"],
    startDate: "Jun 6",
    endDate: "Jun 7",
    durationDays: 2,
    pricePerDay: 90,
    tags: ["Relaxation", "Culture", "History"],
  },
  {
    id: "barcelona",
    destination: "Barcelona",
    country: "Spain",
    tagline: "Gaudí, tapas & the Gothic Quarter",
    description: "Three days of architecture, food, and Mediterranean light.",
    imageUrl: STOCK_IMAGES["barcelona-hero"],
    startDate: "Jul 12",
    endDate: "Jul 14",
    durationDays: 3,
    pricePerDay: 110,
    tags: ["Architecture", "Dining", "Culture"],
  },
  {
    id: "kyoto",
    destination: "Kyoto",
    country: "Japan",
    tagline: "Temples, tea & bamboo groves",
    description: "Three days in Japan's ancient capital, away from the crowds.",
    imageUrl: STOCK_IMAGES["kyoto-hero"],
    startDate: "Apr 5",
    endDate: "Apr 7",
    durationDays: 3,
    pricePerDay: 150,
    tags: ["Culture", "History", "Relaxation"],
  },
];

export const MOCK_PARTICIPANTS: SurveyParticipant[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@example.com",
    completedAt: "2h ago",
    status: "completed",
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@example.com",
    completedAt: "45 min ago",
    status: "completed",
  },
  {
    id: "3",
    name: "Charlie",
    status: "pending",
  },
];
