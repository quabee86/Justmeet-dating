export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  photoUrl: string;
  isVerified: boolean;
  premiumStatus: 'free' | 'gold' | 'platinum';
  lookingFor: 'male' | 'female' | 'everyone';
  ageRangeMin: number;
  ageRangeMax: number;
  religion?: string;
  education?: string;
  languages?: string[];
  createdAt?: string;
}

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio: string;
  location: string;
  occupation: string;
  interests: string[];
  photoUrl: string;
  isVerified: boolean;
  personality: string;
  distance: number; // in miles
  matchScore: number; // percentage
  winkSent?: boolean;
  isFavorite?: boolean;
  hasLiked?: boolean;
  religion?: string;
  education?: string;
  languages?: string[];
  isOnline?: boolean;
  lastActive?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'match';
  type: 'text' | 'voice' | 'wink';
  content: string;
  timestamp: string;
  duration?: number; // for voice messages, in seconds
  isPlayed?: boolean;
  transcription?: string;
  isRead?: boolean;
  readAt?: string;
}

export interface Chat {
  id: string; // matches matchProfile id
  matchProfile: MatchProfile;
  messages: Message[];
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface SearchFilters {
  gender: 'male' | 'female' | 'everyone';
  ageRange: [number, number];
  maxDistance: number; // miles
  verifiedOnly: boolean;
  interests: string[];
}

export interface ProfileVisitor {
  id: string;
  matchProfile: MatchProfile;
  visitedAt: string;
}

export interface ReportReason {
  id: string;
  label: string;
}

export interface AppReport {
  id: string;
  accusedId: string;
  accusedName: string;
  accusedPhoto: string;
  reporterName: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'resolved_dismissed' | 'resolved_warning' | 'resolved_banned';
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  clicks: number;
  impressions: number;
  isActive: boolean;
}

export interface CMSArticle {
  id: string;
  title: string;
  category: 'safety' | 'guidelines' | 'faq' | 'tips';
  content: string;
  lastUpdated: string;
}

export interface PaymentTransaction {
  id: string;
  userEmail: string;
  userName: string;
  tier: 'gold' | 'platinum';
  amount: number;
  timestamp: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  cardBrand: string;
  last4: string;
}

export interface VerificationRequest {
  id: string;
  profileId: string;
  profileName: string;
  profilePhoto: string;
  selfiePhoto: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface CloudFile {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  provider: string;
  key: string;
  uploadDate: string;
}

export interface GoogleContact {
  resourceName: string;
  etag?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  birthday?: string;
  organization?: string;
  gender?: string;
}

