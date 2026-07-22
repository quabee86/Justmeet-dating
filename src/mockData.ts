import { MatchProfile, ProfileVisitor, AppReport, Advertisement, CMSArticle, PaymentTransaction, VerificationRequest } from "./types";

export const AVAILABLE_INTERESTS = [
  "Art", "Cooking", "Wine", "Travel", "Salsa", "Cycling", 
  "Gaming", "Anime", "Matcha", "Photography", "Scuba Diving", 
  "Hiking", "Coffee", "Yoga", "Meditation", "Books", "Tea", 
  "Music", "Concerts", "Craft Beer", "Code", "Swimming", 
  "Beach", "Sushi", "Baking", "Cinema", "Gym", "Furry Friends"
];


export const MOCK_PROFILES: MatchProfile[] = [
  {
    id: "match-1",
    name: "Elena Rostova",
    age: 26,
    gender: "female",
    bio: "Art curator by day, spicy salsa dancer by night. 💃 Looking for someone who can cook a mean carbonara or at least make me laugh. Let's find the best secret cocktail bar in town!",
    location: "Downtown Area",
    occupation: "Modern Art Curator",
    interests: ["Art", "Salsa", "Cooking", "Wine", "Cinema"],
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Vivacious, creative, and spontaneous",
    distance: 2.4,
    matchScore: 94,
    religion: "Christianity",
    education: "Master's Degree",
    languages: ["English", "Russian", "Spanish"],
    isOnline: true,
    lastActive: "Active now"
  },
  {
    id: "match-2",
    name: "Marcus Sterling",
    age: 29,
    gender: "male",
    bio: "Life is too short for bad food. 🍳 Let's explore the local farmers market and argue about whether pineapple belongs on pizza. Down-to-earth and loves spontaneous morning drives.",
    location: "Greenwood",
    occupation: "Sous Chef",
    interests: ["Cooking", "Wine", "Travel", "Cycling", "Craft Beer"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Warm, witty, and passionate about flavor",
    distance: 4.1,
    matchScore: 88,
    religion: "None / Agnostic",
    education: "Associate Degree",
    languages: ["English", "French"],
    isOnline: false,
    lastActive: "Active 3h ago"
  },
  {
    id: "match-3",
    name: "Sarah Lindqvist",
    age: 25,
    gender: "female",
    bio: "Seeking an accomplice for weekend road trips! 🗺️ Currently planning my next dive trip to Indonesia. If you love early mornings, cozy sweaters, and double shot espressos, swipe right.",
    location: "West End",
    occupation: "Travel Journalist",
    interests: ["Scuba Diving", "Hiking", "Coffee", "Photography", "Travel"],
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Adventurous, bubbly, and detail-oriented",
    distance: 1.8,
    matchScore: 97,
    religion: "None / Atheist",
    education: "Bachelor's Degree",
    languages: ["English", "Swedish", "Indonesian"],
    isOnline: true,
    lastActive: "Active now"
  },
  {
    id: "match-4",
    name: "Kenji Sato",
    age: 27,
    gender: "male",
    bio: "Indie game developer who drinks way too much matcha. 🍵 Let's build a blanket fort, play co-op platformers, or wander around taking neon-lit night photography. Highly competitive at Mario Kart.",
    location: "Capitol District",
    occupation: "Game Designer",
    interests: ["Gaming", "Anime", "Matcha", "Photography", "Code"],
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    isVerified: false,
    personality: "Introverted, quirky, and incredibly supportive",
    distance: 5.3,
    matchScore: 82,
    religion: "Buddhism",
    education: "Self-taught / High School",
    languages: ["English", "Japanese"],
    isOnline: true,
    lastActive: "Active now"
  },
  {
    id: "match-5",
    name: "Chloe Vance",
    age: 28,
    gender: "female",
    bio: "Yoga instructor & mindfulness therapist. ✨ Cultivating good vibes, warm loose-leaf tea, and mindful connections. Tell me about your favorite book or the last time you felt truly at peace.",
    location: "East Village",
    occupation: "Yoga Teacher",
    interests: ["Yoga", "Meditation", "Books", "Tea", "Baking"],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Calm, empathetic, and highly reflective",
    distance: 3.2,
    matchScore: 91,
    religion: "Spiritual / Other",
    education: "Bachelor's Degree",
    languages: ["English", "Sanskrit"],
    isOnline: false,
    lastActive: "Active 1d ago"
  },
  {
    id: "match-6",
    name: "Dev Patel",
    age: 31,
    gender: "male",
    bio: "Writing clean code by day, playing vintage fender guitar in local dive bars by night. 🎸 Let's grab a micro-brew craft beer, talk about indie concerts, or debate Star Wars lore.",
    location: "Waterfront",
    occupation: "Senior Backend Developer",
    interests: ["Music", "Concerts", "Craft Beer", "Code", "Cinema"],
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Cool, analytical, with a massive vinyl collection",
    distance: 6.0,
    matchScore: 79,
    religion: "Hinduism",
    education: "Bachelor's Degree",
    languages: ["English", "Hindi"],
    isOnline: true,
    lastActive: "Active now"
  },
  {
    id: "match-7",
    name: "Sofia Alvarez",
    age: 24,
    gender: "female",
    bio: "Save the oceans, but first, feed me sashimi! 🍣 Marine biology student obsessed with sea turtles, beach volleyball tournaments, and acoustic campfire sessions. Let's watch the sunrise together.",
    location: "Seaside Bay",
    occupation: "Marine Biology Student",
    interests: ["Swimming", "Beach", "Sushi", "Music", "Yoga"],
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
    isVerified: true,
    personality: "Sunny, idealistic, and deeply energetic",
    distance: 8.5,
    matchScore: 95,
    religion: "Catholicism",
    education: "Currently in University",
    languages: ["English", "Spanish"],
    isOnline: true,
    lastActive: "Active 5m ago"
  },
  {
    id: "match-8",
    name: "Aiden Mercer",
    age: 26,
    gender: "male",
    bio: "Personal trainer and amateur landscape painter. 🎨 Trying to balance the intense gym life with soft, meditative watercolours. Let's go hiking and paint the mountain view together!",
    location: "Highland Heights",
    occupation: "Fitness Trainer",
    interests: ["Gym", "Art", "Hiking", "Coffee", "Furry Friends"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    isVerified: false,
    personality: "Disciplined, gentle, and highly visual",
    distance: 7.2,
    matchScore: 85,
    religion: "Christianity",
    education: "Bachelor's Degree",
    languages: ["English"],
    isOnline: false,
    lastActive: "Active 12h ago"
  }
];

export const MOCK_VISITORS = (profiles: MatchProfile[]): ProfileVisitor[] => [
  {
    id: "visit-1",
    matchProfile: profiles[0], // Elena
    visitedAt: "20 minutes ago"
  },
  {
    id: "visit-2",
    matchProfile: profiles[2], // Sarah
    visitedAt: "2 hours ago"
  },
  {
    id: "visit-3",
    matchProfile: profiles[4], // Chloe
    visitedAt: "Yesterday at 6:45 PM"
  }
];

export const MOCK_REPORTS = (profiles: MatchProfile[]): AppReport[] => [
  {
    id: "report-101",
    accusedId: "match-4", // Kenji Sato
    accusedName: "Kenji Sato",
    accusedPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    reporterName: "Chloe Vance",
    reason: "Suspiciously fast replies, sending links that look like promotional spam.",
    timestamp: "12 mins ago",
    status: "pending"
  },
  {
    id: "report-102",
    accusedId: "match-8", // Aiden Mercer
    accusedName: "Aiden Mercer",
    accusedPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    reporterName: "Sarah Lindqvist",
    reason: "Profile photo appears to belong to someone else, suspect fake identity.",
    timestamp: "1 hour ago",
    status: "pending"
  }
];

export const MOCK_ADVERTISEMENTS: Advertisement[] = [
  {
    id: "ad-1",
    title: "Starbucks Sweet cold foam brew",
    description: "Upgrade your dating morning! Try our new Sweet Cream Cold Foam Cold Brew today. Order ahead on the Starbucks app. ☕️",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400",
    targetUrl: "https://starbucks.com/menu/product/cold-foam-brew",
    clicks: 142,
    impressions: 1120,
    isActive: true
  },
  {
    id: "ad-2",
    title: "Spotify Duo premium Plan",
    description: "Designed for two. Share the vibe with Spotify Duo. Enjoy offline listening, play any song, ad-free, with two separate Premium accounts.",
    imageUrl: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&q=80&w=400",
    targetUrl: "https://spotify.com/premium/duo",
    clicks: 86,
    impressions: 940,
    isActive: true
  },
  {
    id: "ad-3",
    title: "Salsa Fever Spontaneous Class",
    description: "Learn Salsa in 60 minutes! Exclusive beginners masterclass starting this Saturday. Unleash your dance partner potential.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400",
    targetUrl: "https://justmeet.app/salsa-class",
    clicks: 29,
    impressions: 480,
    isActive: false
  }
];

export const MOCK_CMS_ARTICLES: CMSArticle[] = [
  {
    id: "art-1",
    title: "First Date Safety Rules",
    category: "safety",
    content: "When meeting a connection for the first time, always choose public places like a busy coffee shop or bistro. Arrange your own transportation, let a close friend or family member know where you are going, and never share home addresses early on.",
    lastUpdated: "2 days ago"
  },
  {
    id: "art-2",
    title: "Our Core Community Values",
    category: "guidelines",
    content: "JustMeet Dating is founded on mutual authenticity, respectful communication, and emotional safety. Swearing, aggressive pressuring, scammers, fake marketing bots, and commercial solicitations are strictly disallowed.",
    lastUpdated: "Last week"
  },
  {
    id: "art-3",
    title: "How Facial Verification Works",
    category: "faq",
    content: "Facial verification captures a rapid 3D camera selfie pose, which our automated moderation system matches with your dating profile pictures. This blocks catfish and guarantees every blue checkmark is completely authentic.",
    lastUpdated: "3 days ago"
  },
  {
    id: "art-4",
    title: "3 Icebreakers that Never Fail",
    category: "tips",
    content: "1. Ask what their absolute favorite travel memory is. 2. Joke about their pineapple-on-pizza stance. 3. Ask what song they would sing if forced to do karaoke tonight. Keep it fun and lighthearted!",
    lastUpdated: "Yesterday"
  }
];

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "ch_98jH8ka9B",
    userEmail: "m.sterling@culinary.com",
    userName: "Marcus Sterling",
    tier: "gold",
    amount: 19.99,
    timestamp: "Today, 10:14 AM",
    status: "succeeded",
    cardBrand: "Visa",
    last4: "4242"
  },
  {
    id: "ch_23fK7la4Z",
    userEmail: "chloe.vance@yoga.net",
    userName: "Chloe Vance",
    tier: "platinum",
    amount: 29.99,
    timestamp: "Yesterday, 3:45 PM",
    status: "succeeded",
    cardBrand: "Mastercard",
    last4: "8812"
  },
  {
    id: "ch_11gL9wa1X",
    userEmail: "elena.ro@artgallery.org",
    userName: "Elena Rostova",
    tier: "gold",
    amount: 19.99,
    timestamp: "3 days ago",
    status: "succeeded",
    cardBrand: "Amex",
    last4: "3007"
  }
];

export const MOCK_VERIFICATION_REQUESTS = (profiles: MatchProfile[]): VerificationRequest[] => [
  {
    id: "verify-1",
    profileId: "match-4", // Kenji Sato
    profileName: "Kenji Sato",
    profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    selfiePhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    status: "pending",
    submittedAt: "25 mins ago"
  },
  {
    id: "verify-2",
    profileId: "match-8", // Aiden Mercer
    profileName: "Aiden Mercer",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    selfiePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    status: "pending",
    submittedAt: "2 hours ago"
  }
];

export const MOCK_KEYWORDS = [
  "scam", "crypto", "bitcoin", "whatsapp", "venmo", "onlyfans", "cashapp", 
  "wire transfer", "payment link", "invest", "forex", "binary options", "sugar daddy"
];

