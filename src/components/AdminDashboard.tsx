import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ShieldCheck, Flag, Award, BarChart3, 
  Megaphone, Newspaper, CreditCard, LogOut, RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, getFirestoreQuotaExceeded } from '../lib/firebase';
import { CloudFile, UserProfile, VerificationRequest, AppReport, Advertisement, CMSArticle, PaymentTransaction } from '../types';

import AdminUserManagement, { AdminUser } from './admin/AdminUserManagement';
import AdminVerification from './admin/AdminVerification';
import AdminReportManagement from './admin/AdminReportManagement';
import AdminSubscriptionManagement from './admin/AdminSubscriptionManagement';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminAdsManagement from './admin/AdminAdsManagement';
import AdminCMS from './admin/AdminCMS';
import AdminPaymentMonitoring from './admin/AdminPaymentMonitoring';
import AdminModeration from './admin/AdminModeration';

interface AdminDashboardProps {
  onLogOut: () => void;
  adminEmail: string;
}

export default function AdminDashboard({ onLogOut, adminEmail }: AdminDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'users' | 'verification' | 'reports' | 'subscriptions' | 'analytics' | 'advertisements' | 'cms' | 'payments' | 'moderation'
  >('users');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core Data States
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [reports, setReports] = useState<AppReport[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [cmsArticles, setCmsArticles] = useState<CMSArticle[]>([]);
  const [broadcastBanner, setBroadcastBanner] = useState('💕 Valentine Special: Upgrade to Gold VIP for 50% off!');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Seed Initial Defaults & Load Local Storage Fallback
  useEffect(() => {
    // 1. Initial Mock Reports if empty
    const initialReports: AppReport[] = [
      {
        id: 'rep-101',
        accusedId: 'user-sam@example.com',
        accusedName: 'Sam Taylor',
        accusedPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        reporterName: 'Jessica M.',
        reason: 'Inappropriate language in direct chat message',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'pending'
      },
      {
        id: 'rep-102',
        accusedId: 'user-david@example.com',
        accusedName: 'David K.',
        accusedPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
        reporterName: 'Amanda L.',
        reason: 'Potential fake profile / suspicious photos',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'pending'
      }
    ];

    // 2. Initial Mock Ads
    const initialAds: Advertisement[] = [
      {
        id: 'ad-1',
        title: 'Luxury Date Night Dining Pass',
        description: 'Get 20% off gourmet romantic dinner spots in your city.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
        targetUrl: 'https://justmeetdating.com/dining-pass',
        clicks: 420,
        impressions: 5800,
        isActive: true
      },
      {
        id: 'ad-2',
        title: 'Winery & Weekend Getaways',
        description: 'Plan the ultimate 2-day couples retreat with exclusive rates.',
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600',
        targetUrl: 'https://justmeetdating.com/getaways',
        clicks: 215,
        impressions: 3400,
        isActive: true
      }
    ];

    // 3. Initial Mock CMS Articles
    const initialCmsArticles: CMSArticle[] = [
      {
        id: 'art-1',
        title: 'First Date Safety: Essential Guidelines',
        category: 'safety',
        content: 'Always meet in a well-lit public place, inform a trusted friend about your plans, and keep your personal transportation independent.',
        lastUpdated: '2026-07-20'
      },
      {
        id: 'art-2',
        title: 'How to Craft a Standout Dating Bio',
        category: 'tips',
        content: 'Highlight authentic passions, share positive icebreakers, and use high-resolution recent photos to attract meaningful matches.',
        lastUpdated: '2026-07-18'
      }
    ];

    // 4. Initial Mock Transactions
    const initialTransactions: PaymentTransaction[] = [
      {
        id: 'tx-9901',
        userEmail: 'alex.v@example.com',
        userName: 'Alex Vance',
        tier: 'gold',
        amount: 19.99,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'succeeded',
        cardBrand: 'Visa',
        last4: '4242'
      },
      {
        id: 'tx-9902',
        userEmail: 'sarah.m@example.com',
        userName: 'Sarah Miller',
        tier: 'platinum',
        amount: 39.99,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'succeeded',
        cardBrand: 'Mastercard',
        last4: '8812'
      },
      {
        id: 'tx-9903',
        userEmail: 'ryan.b@example.com',
        userName: 'Ryan Bennett',
        tier: 'gold',
        amount: 19.99,
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        status: 'refunded',
        cardBrand: 'Visa',
        last4: '1092'
      }
    ];

    // Load from local storage if existing
    const savedState = localStorage.getItem('justmeet_admin_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.reports) setReports(parsed.reports); else setReports(initialReports);
        if (parsed.ads) setAds(parsed.ads); else setAds(initialAds);
        if (parsed.cmsArticles) setCmsArticles(parsed.cmsArticles); else setCmsArticles(initialCmsArticles);
        if (parsed.broadcastBanner) setBroadcastBanner(parsed.broadcastBanner);
        if (parsed.transactions) setTransactions(parsed.transactions); else setTransactions(initialTransactions);
      } catch (e) {
        setReports(initialReports);
        setAds(initialAds);
        setCmsArticles(initialCmsArticles);
        setTransactions(initialTransactions);
      }
    } else {
      setReports(initialReports);
      setAds(initialAds);
      setCmsArticles(initialCmsArticles);
      setTransactions(initialTransactions);
    }
  }, []);

  // Save admin state changes to local storage
  const persistAdminState = (updates: any) => {
    try {
      const current = localStorage.getItem('justmeet_admin_state');
      const existing = current ? JSON.parse(current) : {};
      const merged = { ...existing, ...updates };
      localStorage.setItem('justmeet_admin_state', JSON.stringify(merged));
    } catch (e) {
      console.error("Failed to persist admin state:", e);
    }
  };

  // Fetch all users and verification requests from Firestore / Local Storage
  const fetchAllUsersData = async () => {
    setIsRefreshing(true);
    try {
      setErrorMsg(null);
      let loadedUsers: AdminUser[] = [];
      let loadedRequests: VerificationRequest[] = [];

      if (!getFirestoreQuotaExceeded()) {
        try {
          const usersColRef = collection(db, "users");
          const usersSnap = await getDocs(usersColRef);
          
          for (const userDoc of usersSnap.docs) {
            const email = userDoc.id;
            const data = userDoc.data();
            const profile = data.userProfile as UserProfile | undefined;
            
            let userFiles: CloudFile[] = [];
            try {
              const filesColRef = collection(db, "users", email, "files");
              const filesSnap = await getDocs(filesColRef);
              userFiles = filesSnap.docs.map(fd => ({
                id: fd.id,
                ...fd.data()
              } as CloudFile));
            } catch (fileErr) {
              console.warn(`Could not load files for ${email}:`, fileErr);
            }
            
            loadedUsers.push({
              email,
              name: profile?.name || email.split('@')[0],
              photoUrl: profile?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
              createdAt: profile?.createdAt || "2026-07-21",
              fileCount: userFiles.length,
              files: userFiles,
              profile: profile || null,
              status: 'active'
            });
          }
          
          loadedUsers.sort((a, b) => a.name.localeCompare(b.name));

          const verColRef = collection(db, "verificationRequests");
          const verSnap = await getDocs(verColRef);
          loadedRequests = verSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as VerificationRequest[];
        } catch (dbErr) {
          handleFirestoreError(dbErr, "fetchAllUsersData");
        }
      }

      // Merge local storage fallback profiles if needed
      const localStateStr = localStorage.getItem('justmeet_dating_state');
      if (localStateStr) {
        try {
          const parsed = JSON.parse(localStateStr);
          if (parsed.profiles) {
            parsed.profiles.forEach((p: any) => {
              if (!loadedUsers.some(u => u.email === p.email || u.email === p.id)) {
                loadedUsers.push({
                  email: p.email || p.id || 'user@example.com',
                  name: p.name || 'Member Profile',
                  photoUrl: p.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
                  createdAt: "2026-07-21",
                  fileCount: 0,
                  files: [],
                  profile: p,
                  status: 'active'
                });
              }
            });
          }
          if (parsed.verificationRequests && loadedRequests.length === 0) {
            loadedRequests = parsed.verificationRequests;
          }
        } catch (e) {
          console.error(e);
        }
      }

      setUsers(loadedUsers);
      if (!selectedUser && loadedUsers.length > 0) {
        setSelectedUser(loadedUsers[0]);
      }
      setVerificationRequests(loadedRequests);
    } catch (err: any) {
      setErrorMsg(`Data sync notice: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllUsersData();
  }, []);

  // 1. User Management Handlers
  const handleUpdateUserTier = async (email: string, newTier: 'free' | 'gold' | 'platinum') => {
    setUsers(prev => prev.map(u => {
      if (u.email === email && u.profile) {
        return { ...u, profile: { ...u.profile, premiumStatus: newTier } };
      }
      return u;
    }));
    if (selectedUser?.email === email && selectedUser.profile) {
      setSelectedUser({
        ...selectedUser,
        profile: { ...selectedUser.profile, premiumStatus: newTier }
      });
    }

    if (!getFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(db, "users", email);
        await setDoc(userRef, { userProfile: { premiumStatus: newTier } }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, "handleUpdateUserTier");
      }
    }
  };

  const handleToggleUserVerified = async (email: string, isVerified: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.email === email && u.profile) {
        return { ...u, profile: { ...u.profile, isVerified } };
      }
      return u;
    }));
    if (selectedUser?.email === email && selectedUser.profile) {
      setSelectedUser({
        ...selectedUser,
        profile: { ...selectedUser.profile, isVerified }
      });
    }

    if (!getFirestoreQuotaExceeded()) {
      try {
        const userRef = doc(db, "users", email);
        await setDoc(userRef, { userProfile: { isVerified } }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, "handleToggleUserVerified");
      }
    }
  };

  const handleUpdateUserStatus = (email: string, status: 'active' | 'suspended' | 'banned') => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, status } : u));
    if (selectedUser?.email === email) {
      setSelectedUser({ ...selectedUser, status });
    }
  };

  // 2. Verification Handlers
  const handleApproveVerification = async (req: VerificationRequest) => {
    setVerificationRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    handleToggleUserVerified(req.profileId, true);

    if (!getFirestoreQuotaExceeded()) {
      try {
        const reqRef = doc(db, "verificationRequests", req.profileId);
        await setDoc(reqRef, { ...req, status: 'approved' }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, "handleApproveVerification");
      }
    }
  };

  const handleRejectVerification = async (req: VerificationRequest) => {
    setVerificationRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' } : r));
    handleToggleUserVerified(req.profileId, false);

    if (!getFirestoreQuotaExceeded()) {
      try {
        const reqRef = doc(db, "verificationRequests", req.profileId);
        await setDoc(reqRef, { ...req, status: 'rejected' }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, "handleRejectVerification");
      }
    }
  };

  // 3. Report Handlers
  const handleDismissReport = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, status: 'resolved_dismissed' as const } : r);
    setReports(updated);
    persistAdminState({ reports: updated });
  };

  const handleWarnUser = (rep: AppReport) => {
    const updated = reports.map(r => r.id === rep.id ? { ...r, status: 'resolved_warning' as const } : r);
    setReports(updated);
    persistAdminState({ reports: updated });
  };

  const handleBanUserFromReport = (rep: AppReport) => {
    const updated = reports.map(r => r.id === rep.id ? { ...r, status: 'resolved_banned' as const } : r);
    setReports(updated);
    handleUpdateUserStatus(rep.accusedId, 'banned');
    persistAdminState({ reports: updated });
  };

  // 4. Ads Handlers
  const handleToggleAdActive = (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setAds(updated);
    persistAdminState({ ads: updated });
  };

  const handleAddAd = (newAd: Omit<Advertisement, 'id' | 'clicks' | 'impressions'>) => {
    const created: Advertisement = {
      ...newAd,
      id: `ad-${Date.now()}`,
      clicks: 0,
      impressions: 10
    };
    const updated = [created, ...ads];
    setAds(updated);
    persistAdminState({ ads: updated });
  };

  const handleDeleteAd = (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    persistAdminState({ ads: updated });
  };

  // 5. CMS Handlers
  const handleUpdateBroadcastBanner = (msg: string) => {
    setBroadcastBanner(msg);
    persistAdminState({ broadcastBanner: msg });
  };

  const handleAddArticle = (art: Omit<CMSArticle, 'id' | 'lastUpdated'>) => {
    const created: CMSArticle = {
      ...art,
      id: `art-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updated = [created, ...cmsArticles];
    setCmsArticles(updated);
    persistAdminState({ cmsArticles: updated });
  };

  const handleDeleteArticle = (id: string) => {
    const updated = cmsArticles.filter(a => a.id !== id);
    setCmsArticles(updated);
    persistAdminState({ cmsArticles: updated });
  };

  // 6. Payment Handlers
  const handleRefundTransaction = (id: string) => {
    const updated = transactions.map(t => t.id === id ? { ...t, status: 'refunded' as const } : t);
    setTransactions(updated);
    persistAdminState({ transactions: updated });
  };

  return (
    <div id="admin-dashboard-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* HEADER BAR */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20 ring-2 ring-rose-400/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              JustMeet <span className="text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">Admin Console</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Logged in as: <span className="text-slate-200">{adminEmail}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllUsersData}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
            title="Refresh All Operations Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          <button
            onClick={onLogOut}
            className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* TABS NAVIGATION BAR */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 overflow-x-auto scrollbar-none sticky top-[73px] z-30">
        <div className="flex gap-2 min-w-max text-xs">
          {[
            { id: 'users', label: '1. User Management', icon: Users },
            { id: 'verification', label: '2. Profile Verification', icon: ShieldCheck, badge: verificationRequests.filter(r => r.status === 'pending').length },
            { id: 'reports', label: '3. Report Management', icon: Flag, badge: reports.filter(r => r.status === 'pending').length },
            { id: 'subscriptions', label: '4. Subscriptions', icon: Award },
            { id: 'analytics', label: '5. Analytics', icon: BarChart3 },
            { id: 'advertisements', label: '6. Advertisements', icon: Megaphone },
            { id: 'cms', label: '7. CMS', icon: Newspaper },
            { id: 'payments', label: '8. Payments', icon: CreditCard },
            { id: 'moderation', label: '9. Moderation Tools', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl font-extrabold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 bg-white text-rose-600 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'users' && (
          <AdminUserManagement
            users={users}
            isLoading={isLoading}
            errorMsg={errorMsg}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onUpdateUserTier={handleUpdateUserTier}
            onToggleUserVerified={handleToggleUserVerified}
            onUpdateUserStatus={handleUpdateUserStatus}
            onRefresh={fetchAllUsersData}
          />
        )}

        {activeTab === 'verification' && (
          <AdminVerification
            requests={verificationRequests}
            onApprove={handleApproveVerification}
            onReject={handleRejectVerification}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'reports' && (
          <AdminReportManagement
            reports={reports}
            onDismissReport={handleDismissReport}
            onWarnUser={handleWarnUser}
            onBanUser={handleBanUserFromReport}
          />
        )}

        {activeTab === 'subscriptions' && (
          <AdminSubscriptionManagement
            users={users}
            onUpdateUserTier={handleUpdateUserTier}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics
            users={users}
          />
        )}

        {activeTab === 'advertisements' && (
          <AdminAdsManagement
            ads={ads}
            onToggleAdActive={handleToggleAdActive}
            onAddAd={handleAddAd}
            onDeleteAd={handleDeleteAd}
          />
        )}

        {activeTab === 'cms' && (
          <AdminCMS
            articles={cmsArticles}
            broadcastBanner={broadcastBanner}
            onUpdateBroadcastBanner={handleUpdateBroadcastBanner}
            onAddArticle={handleAddArticle}
            onDeleteArticle={handleDeleteArticle}
          />
        )}

        {activeTab === 'payments' && (
          <AdminPaymentMonitoring
            transactions={transactions}
            onRefundTransaction={handleRefundTransaction}
          />
        )}

        {activeTab === 'moderation' && (
          <AdminModeration
            adminEmail={adminEmail}
          />
        )}
      </main>
    </div>
  );
}
