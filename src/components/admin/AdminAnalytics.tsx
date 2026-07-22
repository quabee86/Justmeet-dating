import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ShieldCheck, Heart, Activity, Globe, ArrowUpRight } from 'lucide-react';
import { AdminUser } from './AdminUserManagement';

interface AdminAnalyticsProps {
  users: AdminUser[];
}

export default function AdminAnalytics({ users }: AdminAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const totalMembers = users.length || 1;
  const verifiedCount = users.filter(u => u.profile?.isVerified).length;
  const goldCount = users.filter(u => u.profile?.premiumStatus === 'gold').length;
  const platinumCount = users.filter(u => u.profile?.premiumStatus === 'platinum').length;
  const totalRevenue = (goldCount * 19.99) + (platinumCount * 39.99);

  // Demographic stats
  const maleCount = users.filter(u => u.profile?.gender === 'male').length;
  const femaleCount = users.filter(u => u.profile?.gender === 'female').length;
  const otherCount = users.filter(u => u.profile?.gender === 'other' || !u.profile?.gender).length;

  // Monthly Growth Sample Data
  const growthData = [
    { month: 'Jan', users: 120, revenue: 850 },
    { month: 'Feb', users: 190, revenue: 1320 },
    { month: 'Mar', users: 260, revenue: 1890 },
    { month: 'Apr', users: 340, revenue: 2450 },
    { month: 'May', users: 450, revenue: 3100 },
    { month: 'Jun', users: 580, revenue: 4200 },
    { month: 'Jul', users: totalMembers, revenue: totalRevenue }
  ];

  const maxUsers = Math.max(...growthData.map(d => d.users), 100);

  return (
    <div id="admin-analytics-module" className="space-y-6 text-left">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            Platform Performance & Growth Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry, user retention curves, revenue distribution, and engagement metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(['7d', '30d', '90d', '1y'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                timeRange === t
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Registered Users</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-white">{totalMembers}</h3>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +28.4% growth this month
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</h3>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +19.2% subscriptions
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Identity Verification Rate</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <h3 className="text-2xl font-black text-white">{((verifiedCount / totalMembers) * 100).toFixed(1)}%</h3>
          <p className="text-[11px] text-sky-400 font-bold">{verifiedCount} verified badges active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Daily Match Rate</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <h3 className="text-2xl font-black text-white">84.2%</h3>
          <p className="text-[11px] text-pink-400 font-bold">3,820 Winks & Matches today</p>
        </div>
      </div>

      {/* CHARTS & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Growth Bar Chart */}
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                Member Acquisition & Growth Curve
              </h3>
              <p className="text-xs text-slate-400">Monthly new registrations trend overview</p>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Active Growth
            </span>
          </div>

          {/* SVG/Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {growthData.map((d) => {
              const heightPct = Math.max((d.users / maxUsers) * 100, 10);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {d.users}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl group-hover:from-rose-500 group-hover:to-pink-400 transition-all shadow-md shadow-rose-500/20"
                  />
                  <span className="text-[11px] font-bold text-slate-400 mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Session Duration</span>
              <p className="font-black text-white text-sm mt-0.5">14m 32s</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">7-Day Retention</span>
              <p className="font-black text-emerald-400 text-sm mt-0.5">68.5%</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">VIP Upgrade Rate</span>
              <p className="font-black text-amber-400 text-sm mt-0.5">12.4%</p>
            </div>
          </div>
        </section>

        {/* Demographics & Gender Breakdown */}
        <section className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Member Demographics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Gender distribution & age brackets</p>
          </div>

          {/* Gender Ratio Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Gender Split Ratio</span>
              <span className="text-slate-400">{totalMembers} Members</span>
            </div>

            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex ring-1 ring-slate-800">
              <div
                style={{ width: `${(femaleCount / totalMembers) * 100}%` }}
                className="bg-pink-500 h-full title='Female'"
              />
              <div
                style={{ width: `${(maleCount / totalMembers) * 100}%` }}
                className="bg-sky-500 h-full title='Male'"
              />
              <div
                style={{ width: `${(otherCount / totalMembers) * 100}%` }}
                className="bg-purple-500 h-full title='Other'"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
              <div className="p-2 bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-xl text-center">
                Female: {((femaleCount / totalMembers) * 100).toFixed(0)}%
              </div>
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded-xl text-center">
                Male: {((maleCount / totalMembers) * 100).toFixed(0)}%
              </div>
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl text-center">
                Other: {((otherCount / totalMembers) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Age Brackets */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Age Brackets</span>
            
            {[
              { label: '18 - 24 yrs', pct: '35%', color: 'bg-rose-500' },
              { label: '25 - 34 yrs', pct: '48%', color: 'bg-rose-400' },
              { label: '35 - 44 yrs', pct: '12%', color: 'bg-amber-500' },
              { label: '45+ yrs', pct: '5%', color: 'bg-slate-600' }
            ].map(b => (
              <div key={b.label} className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300 font-bold">
                  <span>{b.label}</span>
                  <span>{b.pct}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div style={{ width: b.pct }} className={`h-full ${b.color}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
