import React, { useState } from 'react';
import { Award, Zap, Check, Sparkles, DollarSign, Users, ShieldCheck, Search, Sliders, ArrowUpRight } from 'lucide-react';
import { AdminUser } from './AdminUserManagement';

interface AdminSubscriptionManagementProps {
  users: AdminUser[];
  onUpdateUserTier: (email: string, tier: 'free' | 'gold' | 'platinum') => void;
}

export default function AdminSubscriptionManagement({
  users,
  onUpdateUserTier
}: AdminSubscriptionManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [overrideTier, setOverrideTier] = useState<'free' | 'gold' | 'platinum'>('gold');

  // Feature Toggles state
  const [featureFlags, setFeatureFlags] = useState({
    unlimitedWinks: true,
    seeWhoLikedYou: true,
    incognitoBrowsing: true,
    passportTravelMode: true,
    aiMatchCoach: true,
    readReceipts: true
  });

  const totalUsers = users.length || 1;
  const goldUsers = users.filter(u => u.profile?.premiumStatus === 'gold');
  const platinumUsers = users.filter(u => u.profile?.premiumStatus === 'platinum');
  const freeUsers = users.filter(u => !u.profile?.premiumStatus || u.profile.premiumStatus === 'free');

  // Calculating Monthly Recurring Revenue (MRR)
  const mrrGold = goldUsers.length * 19.99;
  const mrrPlatinum = platinumUsers.length * 39.99;
  const totalMRR = mrrGold + mrrPlatinum;
  const totalARR = totalMRR * 12;

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserEmail.trim()) return;
    onUpdateUserTier(targetUserEmail.trim(), overrideTier);
    setTargetUserEmail('');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-subscription-module" className="space-y-6 text-left">
      {/* Top Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Monthly Recurring (MRR)</span>
            <h3 className="text-xl font-extrabold text-white">${totalMRR.toFixed(2)}</h3>
            <span className="text-[10px] text-emerald-400 font-bold">ARR: ${totalARR.toFixed(2)} /yr</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gold VIP Subscribers</span>
            <h3 className="text-xl font-extrabold text-white">{goldUsers.length} <span className="text-xs text-slate-400 font-normal">({((goldUsers.length / totalUsers) * 100).toFixed(1)}%)</span></h3>
            <span className="text-[10px] text-amber-400 font-bold">$19.99 / mo per user</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Platinum VIP Subscribers</span>
            <h3 className="text-xl font-extrabold text-white">{platinumUsers.length} <span className="text-xs text-slate-400 font-normal">({((platinumUsers.length / totalUsers) * 100).toFixed(1)}%)</span></h3>
            <span className="text-[10px] text-purple-400 font-bold">$39.99 / mo per user</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Free Tier Members</span>
            <h3 className="text-xl font-extrabold text-white">{freeUsers.length}</h3>
            <span className="text-[10px] text-slate-400 font-bold">Upsell conversion potential</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIP PLAN TIERS & FEATURE OVERVIEW */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              VIP Tier Plan Offerings & Monetization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current subscription plan pricing, limits, and feature entitlements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gold Tier Card */}
            <div className="p-5 bg-gradient-to-b from-amber-500/10 to-slate-950 border border-amber-500/30 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Gold Pass
                </span>
                <span className="text-lg font-black text-white">$19.99 <span className="text-xs text-slate-400 font-normal">/mo</span></span>
              </div>
              <h3 className="text-sm font-extrabold text-white">Gold VIP Experience</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Unlimited Daily Winks & Likes</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> See Who Liked Your Profile</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 1 Free Profile Boost per week</li>
              </ul>
              <div className="pt-2 text-[11px] font-bold text-amber-400">
                Active Users: {goldUsers.length}
              </div>
            </div>

            {/* Platinum Tier Card */}
            <div className="p-5 bg-gradient-to-b from-purple-500/10 to-slate-950 border border-purple-500/30 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-purple-500/20 text-purple-300 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Platinum Pass
                </span>
                <span className="text-lg font-black text-white">$39.99 <span className="text-xs text-slate-400 font-normal">/mo</span></span>
              </div>
              <h3 className="text-sm font-extrabold text-white">Platinum VIP Luxury</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> All Gold VIP Features included</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Incognito Invisible Browsing</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Passport Global Travel Location</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Priority Match AI Recommendations</li>
              </ul>
              <div className="pt-2 text-[11px] font-bold text-purple-400">
                Active Users: {platinumUsers.length}
              </div>
            </div>
          </div>

          {/* Feature Gate Toggles */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Global Feature Entitlement Gates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(featureFlags).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="font-bold text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <button
                    onClick={() => setFeatureFlags(prev => ({ ...prev, [key]: !val }))}
                    className={`w-9 h-5 rounded-full transition-colors relative ${val ? 'bg-rose-500' : 'bg-slate-700'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${val ? 'left-4.5' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MANUAL USER TIER OVERRIDE FORM & SEARCH */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              VIP Access Grant & Override Tool
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly override subscription tier for testing, support, or promo privileges.
            </p>
          </div>

          <form onSubmit={handleApplyOverride} className="space-y-4 bg-slate-950/60 p-4 border border-slate-800 rounded-2xl">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target User Email</label>
              <input
                type="email"
                placeholder="e.g. user@example.com"
                value={targetUserEmail}
                onChange={(e) => setTargetUserEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Tier to Assign</label>
              <div className="grid grid-cols-3 gap-2">
                {(['free', 'gold', 'platinum'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOverrideTier(t)}
                    className={`py-2 rounded-xl text-xs font-black capitalize border transition-all ${
                      overrideTier === t
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              Grant Tier Access Immediately
            </button>
          </form>

          {/* Quick User Search List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick VIP Member Directory</h4>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {filteredUsers.slice(0, 8).map((u) => (
                <div key={u.email} className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-white truncate">{u.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {(['free', 'gold', 'platinum'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => onUpdateUserTier(u.email, tier)}
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          u.profile?.premiumStatus === tier
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
