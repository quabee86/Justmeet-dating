import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  UserProfile, MatchProfile, Chat, Message, SearchFilters, ProfileVisitor,
  AppReport, Advertisement, CMSArticle, PaymentTransaction, VerificationRequest
} from './types';
import { 
  MOCK_PROFILES, MOCK_VISITORS, MOCK_REPORTS, MOCK_ADVERTISEMENTS, 
  MOCK_CMS_ARTICLES, MOCK_TRANSACTIONS, MOCK_VERIFICATION_REQUESTS, MOCK_KEYWORDS 
} from './mockData';
import { 
  Heart, Sparkles, MessageSquare, User, Compass, CreditCard, 
  BadgeCheck, Bell, SlidersHorizontal, Flame, Menu, X, ShieldAlert, Settings, Milestone,
  Volume2, VolumeX, LogOut, HardDrive, Users
} from 'lucide-react';
import { calculateCompatibilityScore } from './utils';
import { playSound, getAudioMuted, setAudioMuted } from './utils/audio';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, getFirestoreQuotaExceeded, handleFirestoreError } from './lib/firebase';

// Sub-components
import SwipeDeck from './components/SwipeDeck';
import DiscoverGrid from './components/DiscoverGrid';
import ChatWindow from './components/ChatWindow';
import PremiumUpgrade from './components/PremiumUpgrade';
import ProfileEditor from './components/ProfileEditor';
import SearchFiltersModal from './components/SearchFiltersModal';
import NotificationToast, { ToastMessage } from './components/NotificationToast';
import SecurityHub from './components/SecurityHub';
import DevelopmentRoadmap from './components/DevelopmentRoadmap';
import AuthGateway from './components/AuthGateway';
import MyCloudVault from './components/MyCloudVault';
import AdminDashboard from './components/AdminDashboard';
import GoogleContactsManager from './components/GoogleContactsManager';

const LOCAL_STORAGE_KEY = 'justmeet_dating_state_v1';

export default function App() {
  // ----------------------------------------------------
  // GLOBAL APPLICATION STATE
  // ----------------------------------------------------
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem('justmeet_logged_in_email'));
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        if (user.email) {
          setCurrentUserEmail(user.email);
          localStorage.setItem('justmeet_logged_in_email', user.email);
        }
      } else {
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        localStorage.removeItem('justmeet_logged_in_email');
      }
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<'swipe' | 'discover' | 'chats' | 'visitors' | 'contacts' | 'premium' | 'profile' | 'security'>('swipe');

  const handleAddMatchFromContact = (newMatch: MatchProfile) => {
    const nextProfiles = [newMatch, ...profiles];
    setProfiles(nextProfiles);
    saveStateToStorage(userProfile, nextProfiles, chats, visitors, searchFilters);
    showToast('match', 'Contact Imported!', `${newMatch.name} added as a potential match in your deck!`, newMatch.photoUrl);
  };
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Kwabena Prempeh",
    age: 25,
    gender: 'male',
    bio: "Passionate about travel blogger spots, live acoustic sessions, and coding up creative products. Let's find the best coffee in the city! ☕️",
    location: "Downtown District",
    occupation: "Software Engineer",
    interests: ["Coffee", "Code", "Music", "Wine", "Travel"],
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    isVerified: false,
    premiumStatus: 'free',
    lookingFor: 'female',
    ageRangeMin: 18,
    ageRangeMax: 35,
    religion: "None / Agnostic",
    education: "Bachelor's Degree",
    languages: ["English", "Spanish"]
  });

  const [profiles, setProfiles] = useState<MatchProfile[]>(MOCK_PROFILES);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [visitors, setVisitors] = useState<ProfileVisitor[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    gender: 'female', // Default matches userProfile lookingFor female
    ageRange: [18, 35],
    maxDistance: 25,
    verifiedOnly: false,
    interests: []
  });

  // Admin states
  const [reports, setReports] = useState<AppReport[]>(MOCK_REPORTS(MOCK_PROFILES));
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(MOCK_ADVERTISEMENTS);
  const [cmsArticles, setCmsArticles] = useState<CMSArticle[]>(MOCK_CMS_ARTICLES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(MOCK_TRANSACTIONS);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(MOCK_VERIFICATION_REQUESTS(MOCK_PROFILES));
  const [moderationKeywords, setModerationKeywords] = useState<string[]>(MOCK_KEYWORDS);

  // UI state
  const cloudSyncTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showMatchModal, setShowMatchModal] = useState<MatchProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioMuted, setAudioMutedState] = useState(getAudioMuted());

  const handleToggleMute = () => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    setAudioMutedState(nextMuted);
    if (!nextMuted) {
      playSound('message');
    }
  };

  // ----------------------------------------------------
  // PERSISTENCE ENGINE (LOCAL STORAGE & CLOUD FIRESTORE)
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Initial Local Storage Fallback Load
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.chats) setChats(parsed.chats);
        if (parsed.visitors) setVisitors(parsed.visitors);
        if (parsed.searchFilters) setSearchFilters(parsed.searchFilters);
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.advertisements) setAdvertisements(parsed.advertisements);
        if (parsed.cmsArticles) setCmsArticles(parsed.cmsArticles);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.verificationRequests) setVerificationRequests(parsed.verificationRequests);
        if (parsed.moderationKeywords) setModerationKeywords(parsed.moderationKeywords);
      } catch (e) {
        console.error("Stale state detected. Resetting to defaults.");
      }
    } else {
      // Preseed a default completed match and conversation with Sarah on first run
      const sarah = MOCK_PROFILES.find(p => p.id === 'match-3');
      if (sarah) {
        const sarahChat: Chat = {
          id: sarah.id,
          matchProfile: sarah,
          messages: [
            {
              id: "sarah-init-1",
              sender: 'match',
              type: 'text',
              content: `Hey Kwabena! 😊 I noticed you write code and love travel. Ready to pack your bags and help me find the absolute best double shot espresso in Greenwood?`,
              timestamp: "10:15 AM"
            }
          ],
          lastMessageTimestamp: "10:15 AM",
          unreadCount: 1
        };
        setChats([sarahChat]);
        setVisitors(MOCK_VISITORS(MOCK_PROFILES));
      }
    }
  }, []);

  // 2. Real-Time Cloud Firestore Sync Loader
  useEffect(() => {
    if (!currentUserEmail || !currentUserId || getFirestoreQuotaExceeded()) return;

    const syncWithCloud = async () => {
      if (getFirestoreQuotaExceeded()) return;
      try {
        console.log("Syncing dating state with Firebase Cloud for:", currentUserEmail);
        const docRef = doc(db, "users", currentUserEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const parsed = docSnap.data();
          if (parsed.userProfile) setUserProfile(parsed.userProfile);
          if (parsed.profiles) setProfiles(parsed.profiles);
          if (parsed.chats) setChats(parsed.chats);
          if (parsed.visitors) setVisitors(parsed.visitors);
          if (parsed.searchFilters) setSearchFilters(parsed.searchFilters);
          if (parsed.reports) setReports(parsed.reports);
          if (parsed.advertisements) setAdvertisements(parsed.advertisements);
          if (parsed.cmsArticles) setCmsArticles(parsed.cmsArticles);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.verificationRequests) setVerificationRequests(parsed.verificationRequests);
          if (parsed.moderationKeywords) setModerationKeywords(parsed.moderationKeywords);
          showToast('system', 'Cloud Synced ✓', 'Dating records and private chats retrieved from Firebase.');
        } else {
          // Document does not exist in Cloud yet. Seed current state to Cloud Firestore.
          const stateToSeed = {
            userProfile,
            profiles,
            chats,
            visitors,
            searchFilters,
            reports,
            advertisements,
            cmsArticles,
            transactions,
            verificationRequests,
            moderationKeywords
          };
          await setDoc(docRef, stateToSeed);
          console.log("Seeded cloud database with initial profile state.");
        }
      } catch (err) {
        handleFirestoreError(err, "syncWithCloud");
      }
    };

    syncWithCloud();
  }, [currentUserEmail, currentUserId]);

  const saveStateToStorage = (
    nextUser: UserProfile = userProfile, 
    nextProfiles: MatchProfile[] = profiles, 
    nextChats: Chat[] = chats, 
    nextVisitors: ProfileVisitor[] = visitors, 
    nextFilters: SearchFilters = searchFilters,
    nextReports: AppReport[] = reports,
    nextAdvertisements: Advertisement[] = advertisements,
    nextCmsArticles: CMSArticle[] = cmsArticles,
    nextTransactions: PaymentTransaction[] = transactions,
    nextVerificationRequests: VerificationRequest[] = verificationRequests,
    nextKeywords: string[] = moderationKeywords
  ) => {
    const stateObj = {
      userProfile: nextUser,
      profiles: nextProfiles,
      chats: nextChats,
      visitors: nextVisitors,
      searchFilters: nextFilters,
      reports: nextReports,
      advertisements: nextAdvertisements,
      cmsArticles: nextCmsArticles,
      transactions: nextTransactions,
      verificationRequests: nextVerificationRequests,
      moderationKeywords: nextKeywords
    };

    // Save to local storage (always reliable and instant)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateObj));
    } catch (e) {
      console.warn("Local storage write error:", e);
    }

    // Debounce Cloud Firestore save to prevent quota consumption and write spams
    if (currentUserEmail && auth.currentUser && !getFirestoreQuotaExceeded()) {
      if (cloudSyncTimerRef.current) {
        clearTimeout(cloudSyncTimerRef.current);
      }
      cloudSyncTimerRef.current = setTimeout(() => {
        if (!getFirestoreQuotaExceeded() && currentUserEmail && auth.currentUser) {
          setDoc(doc(db, "users", currentUserEmail), stateObj)
            .then(() => {
              console.log("Cloud State Successfully Synced to Firestore.");
            })
            .catch(err => {
              handleFirestoreError(err, "saveStateToStorage");
            });
        }
      }, 1500);
    }
  };

  // ----------------------------------------------------
  // REAL-TIME FILTERING & CALCULATIONS
  // ----------------------------------------------------
  const profilesWithScores = profiles.map(p => {
    const result = calculateCompatibilityScore(userProfile, p);
    return {
      ...p,
      matchScore: result.score
    };
  });

  const filteredProfiles = profilesWithScores.filter(p => {
    // 1. Gender check
    if (searchFilters.gender !== 'everyone') {
      if (p.gender !== searchFilters.gender) return false;
    }
    // 2. Age limit check
    if (p.age < searchFilters.ageRange[0] || p.age > searchFilters.ageRange[1]) return false;
    // 3. Distance check
    if (p.distance > searchFilters.maxDistance) return false;
    // 4. Verification Check
    if (searchFilters.verifiedOnly && !p.isVerified) return false;
    // 5. Passion matches check
    if (searchFilters.interests.length > 0) {
      const hasAtLeastOne = searchFilters.interests.some(interest => p.interests.includes(interest));
      if (!hasAtLeastOne) return false;
    }
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);

  // Calculate unread chat messages
  const totalUnreadChats = chats.reduce((acc, chat) => acc + chat.unreadCount, 0);

  // ----------------------------------------------------
  // EVENT TRIGGER HANDLERS
  // ----------------------------------------------------
  const showToast = (type: ToastMessage['type'], title: string, description: string, photoUrl?: string) => {
    const nextToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      description,
      photoUrl
    };
    setToasts(prev => [...prev, nextToast]);

    // Trigger subtle synthesized sound cues
    if (type === 'match') {
      playSound('match');
    } else if (type === 'wink') {
      playSound('wink');
    }

    // Auto clear toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== nextToast.id));
    }, 5000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Periodic simulated background notifications (Push notifications mock)
  useEffect(() => {
    const timers = [
      setTimeout(() => {
        // Elena winks
        const elena = profiles.find(p => p.id === 'match-1');
        if (elena) {
          showToast('wink', 'Wink Received! 😉', `${elena.name} just sent you a playful wink. Connect now!`, elena.photoUrl);
          // Add Elena to profile visitor log
          const newVisitor: ProfileVisitor = {
            id: `visit-${Date.now()}`,
            matchProfile: elena,
            visitedAt: "Just now"
          };
          const nextVisitors = [newVisitor, ...visitors];
          setVisitors(nextVisitors);
          saveStateToStorage(userProfile, profiles, chats, nextVisitors, searchFilters);
        }
      }, 18000),

      setTimeout(() => {
        // Marcus visits profile
        const marcus = profiles.find(p => p.id === 'match-2');
        if (marcus) {
          showToast('visitor', 'Profile Visitor! 👀', `${marcus.name} just viewed your dating profile.`, marcus.photoUrl);
          const newVisitor: ProfileVisitor = {
            id: `visit-marcus-${Date.now()}`,
            matchProfile: marcus,
            visitedAt: "Just now"
          };
          const nextVisitors = [newVisitor, ...visitors];
          setVisitors(nextVisitors);
          saveStateToStorage(userProfile, profiles, chats, nextVisitors, searchFilters);
        }
      }, 42000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [profiles, visitors]);

  // Swipe Deck Action callbacks
  const handleLike = (match: MatchProfile) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === match.id) return { ...p, hasLiked: true };
      return p;
    });
    setProfiles(updatedProfiles);

    // Mutual match probability! High probability if wink was sent, 40% normally
    const matchProbability = match.winkSent ? 1.0 : 0.45;
    const isMutualMatch = Math.random() < matchProbability;

    if (isMutualMatch) {
      setTimeout(() => {
        triggerMutualMatch(match);
      }, 600);
    } else {
      showToast('system', 'Like Sent', `You swiped right on ${match.name}. We'll notify you if it's mutual!`);
      saveStateToStorage(userProfile, updatedProfiles, chats, visitors, searchFilters);
    }
  };

  const handleDislike = (match: MatchProfile) => {
    showToast('system', 'Passed', `Passed on ${match.name}.`);
  };

  const handleWink = (match: MatchProfile) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === match.id) return { ...p, winkSent: true };
      return p;
    });
    setProfiles(updatedProfiles);
    showToast('wink', 'Wink Sent! 😉', `You sent a wink to ${match.name}. Match probability increased!`, match.photoUrl);
    saveStateToStorage(userProfile, updatedProfiles, chats, visitors, searchFilters);
  };

  const handleFavorite = (match: MatchProfile) => {
    const updatedProfiles = profiles.map(p => {
      if (p.id === match.id) return { ...p, isFavorite: !p.isFavorite };
      return p;
    });
    setProfiles(updatedProfiles);
    const isFav = updatedProfiles.find(p => p.id === match.id)?.isFavorite;
    showToast(
      'system', 
      isFav ? 'Added to Favorites ⭐' : 'Removed from Favorites', 
      isFav ? `You marked ${match.name} as a favorite connection.` : `Removed ${match.name} from favorites.`
    );
    saveStateToStorage(userProfile, updatedProfiles, chats, visitors, searchFilters);
  };

  const triggerMutualMatch = (match: MatchProfile) => {
    setShowMatchModal(match);
    
    // Check if chat already exists
    const chatExists = chats.find(c => c.id === match.id);
    let nextChats = [...chats];
    
    if (!chatExists) {
      // Build clever personalized matching starter message
      let starterMsgText = `Hey! So glad we matched! 😊 Your profile interests of ${userProfile.interests.slice(0,2).join(" & ")} caught my eye. What's your idea of a perfect first date?`;
      if (match.id === 'match-1') {
        starterMsgText = `Hey Kwabena! 💃 Salsa curation by night, curation by day. So glad we matched! Ready to share your favorite jazz bar with me? 🍷`;
      } else if (match.id === 'match-5') {
        starterMsgText = `Namaste! ✨ Mindful connections are everything. I loved your profile energy. What is the last book that genuinely changed your outlook?`;
      } else if (match.id === 'match-7') {
        starterMsgText = `Oh hey Kwabena! 🌊 Let's go beach combing or grabbing spicy sushi! What is your go-to weekend playlist? 🍣`;
      }

      const newChat: Chat = {
        id: match.id,
        matchProfile: match,
        messages: [
          {
            id: `init-${Date.now()}`,
            sender: 'match',
            type: 'text',
            content: starterMsgText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 1
      };
      nextChats = [newChat, ...chats];
      setChats(nextChats);
    }

    showToast('match', "It's a Mutual Match! 🎉", `You and ${match.name} matched! Send them a sweet text.`, match.photoUrl);
    saveStateToStorage(userProfile, profiles, nextChats, visitors, searchFilters);
  };

  // Block or Report Match User
  const handleBlockMatch = (matchId: string) => {
    // Remove profile from list entirely
    const updatedProfiles = profiles.filter(p => p.id !== matchId);
    setProfiles(updatedProfiles);
    
    // Delete any active chat
    const updatedChats = chats.filter(c => c.id !== matchId);
    setChats(updatedChats);

    if (activeChatId === matchId) {
      setActiveChatId(null);
    }

    showToast('system', 'Connection Removed', `You have blocked and hidden this profile securely.`);
    saveStateToStorage(userProfile, updatedProfiles, updatedChats, visitors, searchFilters);
  };

  // On message sent from Chat Window
  const handleSendMessage = (chatId: string, message: Message) => {
    // Play subtle audio bubble-pop/chirp feedback
    playSound('message');

    const nextChats = chats.map(chat => {
      if (chat.id === chatId) {
        // Clear unread count when user is typing in it
        const nextUnread = message.sender === 'match' ? chat.unreadCount + 1 : 0;
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessageTimestamp: message.timestamp,
          unreadCount: nextUnread
        };
      }
      return chat;
    });
    setChats(nextChats);
    saveStateToStorage(userProfile, profiles, nextChats, visitors, searchFilters);
  };

  const handleReportMatch = (matchId: string, reason: string) => {
    const accused = profiles.find(p => p.id === matchId);
    if (!accused) return;
    const newReport: AppReport = {
      id: `report-${Date.now()}`,
      accusedId: accused.id,
      accusedName: accused.name,
      accusedPhoto: accused.photoUrl,
      reporterName: userProfile.name,
      reason: reason,
      timestamp: "Just now",
      status: 'pending'
    };
    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    saveStateToStorage(userProfile, profiles, chats, visitors, searchFilters, nextReports);
  };

  const handleMarkMessagesRead = (chatId: string) => {
    const nextChats = chats.map(c => {
      if (c.id === chatId) {
        const updatedMessages = c.messages.map(m => {
          if (m.sender === 'user' && !m.isRead) {
            return {
              ...m,
              isRead: true,
              readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return m;
        });
        return { ...c, messages: updatedMessages, unreadCount: 0 };
      }
      return c;
    });
    setChats(nextChats);
    saveStateToStorage(userProfile, profiles, nextChats, visitors, searchFilters);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Mark as read (both unread count and user messages read receipt)
    const nextChats = chats.map(c => {
      if (c.id === chatId) {
        const updatedMessages = c.messages.map(m => {
          if (m.sender === 'user' && !m.isRead) {
            return {
              ...m,
              isRead: true,
              readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return m;
        });
        return { ...c, messages: updatedMessages, unreadCount: 0 };
      }
      return c;
    });
    setChats(nextChats);
    saveStateToStorage(userProfile, profiles, nextChats, visitors, searchFilters);
  };

  // Profile Editor Callback
  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setUserProfile(nextProfile);
    showToast('system', 'Profile Saved ✓', 'Your details have been successfully saved.');
    saveStateToStorage(nextProfile, profiles, chats, visitors, searchFilters);
  };

  // Premium Billing Tier Callback
  const handleUpgradeStatus = (tier: 'gold' | 'platinum') => {
    const nextUser: UserProfile = { ...userProfile, premiumStatus: tier };
    setUserProfile(nextUser);
    saveStateToStorage(nextUser, profiles, chats, visitors, searchFilters);
  };

  const handleResetSwipes = () => {
    const resetProfiles = profiles.map(p => ({ ...p, hasLiked: false }));
    setProfiles(resetProfiles);
    showToast('system', 'Deck Replenished 💫', 'All profiles loaded back into your swipe deck!');
    saveStateToStorage(userProfile, resetProfiles, chats, visitors, searchFilters);
  };

  const handleLogOut = () => {
    signOut(auth).catch(err => console.error("Firebase SignOut error:", err));
    localStorage.removeItem('justmeet_logged_in_email');
    setCurrentUserEmail(null);
    showToast('system', 'Logged Out 🔒', 'Securely logged out of your dating profile.');
  };

  const handleLoginSuccess = (profile: UserProfile, email: string) => {
    localStorage.setItem('justmeet_logged_in_email', email);
    setCurrentUserEmail(email);
    setUserProfile(profile);
    saveStateToStorage(profile, profiles, chats, visitors, searchFilters);
    showToast('system', 'Session Established 🔑', `Welcome, ${profile.name}! Connecting sparks...`);
  };

  if (!currentUserEmail) {
    return (
      <div id="justmeet-auth-root" className="min-h-screen bg-slate-950 relative">
        <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
        <AuthGateway
          onLoginSuccess={handleLoginSuccess}
          audioMuted={audioMuted}
          onToggleMute={handleToggleMute}
        />
      </div>
    );
  }

  // Check if logged-in user is the designated admin
  if (currentUserId === 'hhrLJgwvxueN5WyQLVZpcmyRlml1' || currentUserEmail === 'kwabenaprempeh86@gmail.com') {
    return (
      <AdminDashboard
        onLogOut={handleLogOut}
        adminEmail={currentUserEmail || 'kwabenaprempeh86@gmail.com'}
      />
    );
  }

  return (
    <div id="justmeet-app-root" className="min-h-screen bg-rose-50/10 font-sans antialiased text-gray-800 flex flex-col md:flex-row relative">
      
      {/* ----------------------------------------------------
          TOP-RIGHT SPRING-NOTIFICATION CENTER
          ---------------------------------------------------- */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />

      {/* ----------------------------------------------------
          NAVIGATION SIDEBAR (DESKTOP)
          ---------------------------------------------------- */}
      <aside id="desktop-sidebar" className="hidden md:flex w-64 bg-white border-r border-rose-100 flex-col justify-between shrink-0 sticky top-0 h-screen select-none">
        
        {/* Brand Logo & Title */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            <Flame className="w-8 h-8 text-rose-500 fill-rose-500" />
            <h1 className="font-display font-black text-2xl tracking-tight select-none">
              JustMeet
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {[
              { id: 'swipe', label: 'Match Swipe Deck', icon: Flame },
              { id: 'discover', label: 'Discover Matches', icon: Compass },
              { id: 'chats', label: 'Private Chats', icon: MessageSquare, badge: totalUnreadChats },
              { id: 'visitors', label: 'Dating Activity', icon: Bell, badge: visitors.length },
              { id: 'contacts', label: 'Google Contacts', icon: Users },
              { id: 'premium', label: 'Premium Upgrades', icon: CreditCard },
              { id: 'profile', label: 'My Profile Editor', icon: User, verified: userProfile.isVerified },
              { id: 'security', label: 'Security & Privacy', icon: ShieldAlert }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sidebar-link-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between font-semibold text-sm transition-all ${
                    isActive 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10 scale-[1.01]' 
                      : 'text-gray-600 hover:bg-rose-50/40 hover:text-rose-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full leading-tight ${isActive ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                  {tab.verified && <BadgeCheck className="w-4 h-4 text-sky-400 fill-white" />}
                </button>
              );
            })}


          </nav>
        </div>

        {/* User Card footer block */}
        <div className="p-4 border-t border-rose-100 bg-rose-50/10 flex items-center justify-between gap-2">
          <button
            id="sidebar-user-card"
            onClick={() => setActiveTab('profile')}
            className="flex-1 p-2 rounded-xl hover:bg-rose-50/40 transition-all flex items-center gap-2.5 text-left border border-transparent hover:border-rose-100 min-w-0"
          >
            <img
              src={userProfile.photoUrl}
              alt=""
              className="w-8 h-8 rounded-lg object-cover shrink-0 ring-2 ring-rose-500/10"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-[11px] text-gray-900 truncate flex items-center gap-1">
                {userProfile.name}
                {userProfile.isVerified && <BadgeCheck id="user-badge" className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />}
              </h5>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                {userProfile.premiumStatus === 'free' ? 'Standard Tier' : `JustMeet ${userProfile.premiumStatus}`}
              </p>
            </div>
          </button>
          
          <button
            id="sidebar-logout-btn"
            onClick={handleLogOut}
            title="Log Out Securely"
            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------
          MOBILE NAVBAR HEADER & HAMBURGER
          ---------------------------------------------------- */}
      <header id="mobile-header" className="md:hidden w-full bg-white border-b border-rose-100 p-4 sticky top-0 z-40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-rose-500">
          <Flame className="w-6 h-6 fill-rose-500" />
          <span className="font-display font-black text-lg tracking-tight">JustMeet</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications bell badge */}
          <button
            id="mobile-visitors-bell"
            onClick={() => setActiveTab('visitors')}
            className="p-2 text-gray-500 hover:text-rose-500 relative"
          >
            <Bell className="w-5 h-5" />
            {visitors.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            id="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-rose-500 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE COLLAPSED MENU DRAWER */}
      {mobileMenuOpen && (
        <nav id="mobile-drawer" className="md:hidden fixed top-[57px] left-0 right-0 z-40 bg-white border-b border-rose-100 p-4 shadow-xl flex flex-col gap-2">
          {[
            { id: 'swipe', label: 'Match Swipe Deck', icon: Flame },
            { id: 'discover', label: 'Discover Matches', icon: Compass },
            { id: 'chats', label: 'Private Chats', icon: MessageSquare, badge: totalUnreadChats },
            { id: 'visitors', label: 'Dating Activity', icon: Bell, badge: visitors.length },
            { id: 'contacts', label: 'Google Contacts', icon: Users },
            { id: 'premium', label: 'Premium Upgrades', icon: CreditCard },
            { id: 'profile', label: 'My Profile Editor', icon: User },
            { id: 'security', label: 'Security & Privacy', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-link-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl flex items-center justify-between font-bold text-xs transition-colors ${
                  isActive ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-rose-50/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className={`text-[9px] font-extrabold py-0.5 px-2 rounded-full ${isActive ? 'bg-white text-rose-500' : 'bg-rose-500 text-white'}`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}



          <button
            id="mobile-logout-btn"
            onClick={() => {
              handleLogOut();
              setMobileMenuOpen(false);
            }}
            className="w-full p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center gap-3 font-bold text-xs transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Securely</span>
          </button>
        </nav>
      )}

      {/* ----------------------------------------------------
          MAIN SCREEN PANE
          ---------------------------------------------------- */}
      <main id="main-content-pane" className="flex-1 max-w-full md:max-w-5xl lg:max-w-6xl mx-auto w-full flex flex-col p-4 md:py-8 md:px-10 justify-start">
        
        {/* Title stage header */}
        <div className="text-left mb-6 shrink-0 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-black text-gray-950 tracking-tight flex items-center gap-1.5 capitalize">
              {activeTab === 'swipe' && 'Connect Swipes'}
              {activeTab === 'discover' && 'Browse passional matches'}
              {activeTab === 'chats' && 'Dating conversations'}
              {activeTab === 'visitors' && 'Visitor dashboard logs'}
              {activeTab === 'contacts' && 'Google Contacts Integration'}
              {activeTab === 'premium' && 'Premium privileges'}
              {activeTab === 'profile' && 'My Profile details'}
              {activeTab === 'security' && 'Security & Privacy Hub'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {activeTab === 'swipe' && 'Swipe right to connect, send winks, or favorite recommended profiles.'}
              {activeTab === 'discover' && 'Browse profiles filtering by age limit, distance, verification checkmarks, or specific hobbies.'}
              {activeTab === 'chats' && 'Talk directly with your mutual dating matches in real-time, record voice, or launch video calls.'}
              {activeTab === 'visitors' && 'Review who looked at your profile recently or sent you flirty wink highlights.'}
              {activeTab === 'contacts' && 'Sync your Google Account contacts to invite friends, import connections as matches, or create contact entries.'}
              {activeTab === 'premium' && 'Subscribe securely with mock Stripe billing to access infinite swipes & global locations.'}
              {activeTab === 'profile' && 'Update your bio details, upload pictures, and complete face selfie biometric verifications.'}
              {activeTab === 'security' && 'Manage password hashing, active JWT sessions, multi-device 2FA, AI SafeSearch moderation, and compliance rights.'}
            </p>
          </div>

          <button
            id="global-audio-toggle-btn"
            onClick={handleToggleMute}
            title={audioMuted ? "Unmute dating sparks audio" : "Mute dating sparks audio"}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 font-bold text-xs shrink-0 select-none ${
              audioMuted 
                ? 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100/70 hover:text-gray-500' 
                : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50'
            }`}
          >
            {audioMuted ? (
              <VolumeX className="w-4 h-4 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
            )}
            <span className="hidden sm:inline">{audioMuted ? "Audio Muted" : "Audio Active"}</span>
          </button>
        </div>

        {/* Tab Router Panels */}
        <div id="router-panel-stage" className="flex-1">
          {activeTab === 'swipe' && (
            <SwipeDeck
              profiles={filteredProfiles.filter(p => !p.hasLiked)}
              userProfile={userProfile}
              onLike={handleLike}
              onDislike={handleDislike}
              onWink={handleWink}
              onFavorite={handleFavorite}
              onReset={handleResetSwipes}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverGrid
              profiles={filteredProfiles}
              userProfile={userProfile}
              filters={searchFilters}
              onOpenFilters={() => setIsFiltersOpen(true)}
              onLike={handleLike}
              onFavorite={handleFavorite}
              onWink={handleWink}
            />
          )}

          {activeTab === 'chats' && (
            <ChatWindow
              chats={chats}
              activeChatId={activeChatId}
              userProfile={userProfile}
              onSelectChat={handleSelectChat}
              onSendMessage={handleSendMessage}
              onMarkMessagesRead={handleMarkMessagesRead}
              onBlockMatch={handleBlockMatch}
              onReportMatch={handleReportMatch}
            />
          )}

          {activeTab === 'visitors' && (
            <div id="visitors-dashboard" className="space-y-6">
              {/* Visitors Section */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm text-left">
                <h3 className="font-extrabold text-base text-gray-900 mb-1">Recent Profile Visitors</h3>
                <p className="text-xs text-gray-400 mb-4">These potential connections visited your profile recently</p>
                
                {visitors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visitors.map((v) => (
                      <div
                        key={v.id}
                        id={`visitor-item-${v.id}`}
                        onClick={() => {
                          setSearchFilters({ ...searchFilters, gender: 'everyone' }); // Open swipe accessibility
                          setActiveTab('swipe');
                        }}
                        className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-rose-50/20 hover:border-rose-100 transition-all text-left"
                      >
                        <img
                          src={v.matchProfile.photoUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-rose-500/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-gray-900 truncate flex items-center gap-1">
                            {v.matchProfile.name}
                            {v.matchProfile.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400 shrink-0" />}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">Visited {v.visitedAt}</p>
                        </div>
                        <span className="text-[9px] bg-rose-50 text-rose-500 font-extrabold uppercase py-1 px-2 rounded-full border border-rose-100 shrink-0">
                          Connect
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No recent visitors logged. Try swiping to trigger profile activity!</p>
                )}
              </div>

              {/* Winks Activity received Section */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm text-left">
                <h3 className="font-extrabold text-base text-gray-900 mb-1">Wink Notifications</h3>
                <p className="text-xs text-gray-400 mb-4">Matches who wined/winked to express special interest in you</p>

                {profiles.filter(p => p.winkSent).length > 0 ? (
                  <div className="space-y-2.5">
                    {profiles.filter(p => p.winkSent).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 border border-amber-50 bg-amber-50/10 rounded-2xl flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.photoUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-gray-900 block truncate">{p.name} sent you a Wink!</span>
                            <span className="text-[10px] text-amber-600 font-semibold mt-0.5">Likes you 100% mutually</span>
                          </div>
                        </div>

                        <button
                          id={`wink-back-btn-${p.id}`}
                          onClick={() => {
                            handleLike(p);
                          }}
                          className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/10 transition-colors"
                        >
                          Like Back
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No winks logged. Send winks on the Swipe Deck to spark mutual interactions!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <GoogleContactsManager
              onAddMatchFromContact={handleAddMatchFromContact}
              onShowToast={(msg, type) => showToast('system', type === 'error' ? 'Notice' : 'Google Contacts', msg)}
            />
          )}

          {activeTab === 'premium' && (
            <PremiumUpgrade
              profile={userProfile}
              onUpgrade={handleUpgradeStatus}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileEditor
              profile={userProfile}
              onUpdate={handleUpdateProfile}
            />
          )}

          {activeTab === 'security' && (
            <SecurityHub
              userProfile={userProfile}
              chats={chats}
              transactions={transactions}
              onUpdateUserProfile={handleUpdateProfile}
              onAddToast={(type, title, desc) => showToast(type, title, desc)}
              onDeleteAccount={() => {
                const wipedUser: UserProfile = {
                  name: "Anonymous User",
                  age: 18,
                  gender: 'male',
                  bio: "Data completely purged per GDPR Article 17 request.",
                  location: "System Disconnected",
                  occupation: "Deactivated Account",
                  interests: [],
                  photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
                  isVerified: false,
                  premiumStatus: 'free',
                  lookingFor: 'everyone',
                  ageRangeMin: 18,
                  ageRangeMax: 99,
                  religion: "None / Agnostic",
                  education: "High School",
                  languages: ["English"]
                };
                setUserProfile(wipedUser);
                setChats([]);
                setVisitors([]);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                localStorage.removeItem('justmeet_logged_in_email');
                setCurrentUserEmail(null);
                setActiveTab('profile');
                showToast('system', 'Records Erased ✓', 'Your data has been successfully deleted. Returning to login.');
              }}
            />
          )}


        </div>
      </main>

      {/* ----------------------------------------------------
          ADVANCED SEARCH FILTERS MODAL POPUP
          ---------------------------------------------------- */}
      <SearchFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={searchFilters}
        onChange={(nextFilters) => {
          setSearchFilters(nextFilters);
          saveStateToStorage(userProfile, profiles, chats, visitors, nextFilters);
        }}
      />

      {/* ----------------------------------------------------
          MUTUAL MATCH CELEBRATION MODAL OVERLAY
          ---------------------------------------------------- */}
      <AnimatePresence>
        {showMatchModal && (
          <div id="match-celebration-backdrop" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            
            {/* FLOATING HEART PARTICLES (CELEBRATION OVERLAY) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 text-red-500/50 animate-bounce text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${2.5 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${16 + Math.random() * 24}px`
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            <div className="max-w-sm w-full text-center space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
              {/* Match Header sparkles */}
              <div className="space-y-2">
                <div className="flex justify-center text-rose-500 fill-rose-500 gap-1.5 animate-pulse">
                  <Heart className="w-10 h-10 fill-current" />
                  <Sparkles className="w-10 h-10 text-amber-400" />
                  <Heart className="w-10 h-10 fill-current" />
                </div>
                <h3 className="font-display font-black text-4xl tracking-tight bg-gradient-to-r from-pink-400 via-rose-500 to-yellow-400 bg-clip-text text-transparent uppercase">
                  It's a Match!
                </h3>
                <p className="text-xs text-gray-300">You and {showMatchModal.name} swiped right on each other.</p>
              </div>

              {/* Facing Avatar Circles */}
              <div className="flex items-center justify-center gap-6 py-4">
                {/* User avatar */}
                <div className="relative">
                  <img
                    src={userProfile.photoUrl}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-500 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 bg-rose-500 text-white font-extrabold text-[10px] py-1 px-2 rounded-full leading-none">
                    You
                  </span>
                </div>

                {/* Sparkling connector */}
                <div className="text-rose-500 text-2xl font-black shrink-0 animate-ping">⚡</div>

                {/* Match avatar */}
                <div className="relative">
                  <img
                    src={showMatchModal.photoUrl}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-500 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {showMatchModal.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-sky-400 fill-sky-400 absolute bottom-0 right-0" />
                  )}
                </div>
              </div>

              {/* Match Bio extract */}
              <p className="text-sm italic text-gray-300 leading-relaxed px-4">
                "{showMatchModal.bio}"
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full px-6">
                <button
                  id="celebrate-send-msg-btn"
                  onClick={() => {
                    setActiveChatId(showMatchModal.id);
                    setActiveTab('chats');
                    setShowMatchModal(null);
                  }}
                  className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  <span>Send Introductory Text</span>
                </button>
                <button
                  id="celebrate-keep-swiping-btn"
                  onClick={() => setShowMatchModal(null)}
                  className="w-full py-3 border border-white/20 hover:bg-white/5 text-gray-200 text-xs font-semibold rounded-2xl transition-all"
                >
                  Keep Swiping
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
