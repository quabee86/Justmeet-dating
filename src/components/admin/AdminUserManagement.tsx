import React, { useState } from 'react';
import { 
  Users, Search, Calendar, HardDrive, Eye, Image as ImageIcon, 
  Video, Music, FileText, File, ShieldCheck, Ban, ShieldAlert, CheckCircle2, XCircle, Award
} from 'lucide-react';
import { CloudFile, UserProfile } from '../../types';

export interface AdminUser {
  email: string;
  name: string;
  photoUrl: string;
  createdAt: string;
  fileCount: number;
  files: CloudFile[];
  profile: UserProfile | null;
  status?: 'active' | 'suspended' | 'banned';
}

interface AdminUserManagementProps {
  users: AdminUser[];
  isLoading: boolean;
  errorMsg: string | null;
  selectedUser: AdminUser | null;
  onSelectUser: (user: AdminUser) => void;
  onUpdateUserTier: (email: string, newTier: 'free' | 'gold' | 'platinum') => void;
  onToggleUserVerified: (email: string, isVerified: boolean) => void;
  onUpdateUserStatus: (email: string, status: 'active' | 'suspended' | 'banned') => void;
  onRefresh: () => void;
}

export default function AdminUserManagement({
  users,
  isLoading,
  errorMsg,
  selectedUser,
  onSelectUser,
  onUpdateUserTier,
  onToggleUserVerified,
  onUpdateUserStatus,
  onRefresh
}: AdminUserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'verified' | 'vip'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.profile?.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return (user.status || 'active') === 'active';
    if (statusFilter === 'suspended') return user.status === 'suspended';
    if (statusFilter === 'banned') return user.status === 'banned';
    if (statusFilter === 'verified') return user.profile?.isVerified;
    if (statusFilter === 'vip') return user.profile?.premiumStatus && user.profile.premiumStatus !== 'free';
    
    return true;
  });

  const getFileIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />;
    if (lower.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
    if (lower.startsWith('audio/')) return <Music className="w-4 h-4 text-amber-500 shrink-0" />;
    if (lower.includes('pdf') || lower.includes('word') || lower.includes('text')) {
      return <FileText className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  return (
    <div id="admin-user-management-module" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
      {/* LEFT COLUMN: LIST OF USERS */}
      <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500" />
              Member Accounts Management ({users.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Audit dating profiles, toggle badges, manage status & cloud vaults</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search email, name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap text-xs">
          {[
            { id: 'all', label: `All (${users.length})` },
            { id: 'active', label: 'Active' },
            { id: 'verified', label: 'Verified' },
            { id: 'vip', label: 'VIP Pass' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'banned', label: 'Banned' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                statusFilter === f.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-bold">Querying secure user directory...</div>
        ) : errorMsg ? (
          <div className="py-12 border border-rose-950/50 bg-rose-950/10 rounded-2xl p-6 text-center text-xs text-rose-400">
            {errorMsg}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs italic">
            No matching dating profiles found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800/80">
                    <th className="p-3.5">Dating Profile</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Tier & Status</th>
                    <th className="p-3.5 text-center">Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUser?.email === user.email;
                    const status = user.status || 'active';
                    return (
                      <tr
                        key={user.email}
                        onClick={() => onSelectUser(user)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-rose-500/10 hover:bg-rose-500/15 border-l-2 border-l-rose-500' 
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photoUrl}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-100 truncate flex items-center gap-1">
                                {user.name}
                                {user.profile?.isVerified && (
                                  <span className="text-[10px] bg-sky-500/15 text-sky-400 px-1.5 py-0.5 rounded font-black border border-sky-500/20 scale-90 shrink-0">
                                    Verified
                                  </span>
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium capitalize">
                                {user.profile?.gender || 'N/A'} • {user.profile?.age || 'N/A'} yrs
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-300 select-all">{user.email}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              user.profile?.premiumStatus === 'platinum' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : user.profile?.premiumStatus === 'gold' 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : 'bg-slate-800 text-slate-400'
                            }`}>
                              {user.profile?.premiumStatus || 'free'}
                            </span>
                            {status === 'banned' ? (
                              <span className="text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                                Banned
                              </span>
                            ) : status === 'suspended' ? (
                              <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                Suspended
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            user.fileCount > 0 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-slate-800/40 text-slate-500'
                          }`}>
                            <HardDrive className="w-3 h-3" />
                            <span>{user.fileCount}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* RIGHT COLUMN: USER DETAIL & CONTROLS */}
      <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 min-h-[400px]">
        {selectedUser ? (
          <div className="space-y-5 animate-fadeIn">
            {/* User Header */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <img
                src={selectedUser.photoUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-white truncate">{selectedUser.name}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedUser.profile?.premiumStatus === 'platinum'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : selectedUser.profile?.premiumStatus === 'gold'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedUser.profile?.premiumStatus || 'free'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{selectedUser.email}</p>
                
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                  <span>Age: <strong className="text-slate-200">{selectedUser.profile?.age || 'N/A'}</strong></span>
                  <span>Gender: <strong className="text-slate-200 capitalize">{selectedUser.profile?.gender || 'N/A'}</strong></span>
                  <span>Loc: <strong className="text-slate-200">{selectedUser.profile?.location || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            {/* Admin Override Controls */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Administrative Account Overrides
              </h4>

              {/* VIP Tier Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">VIP Subscription Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['free', 'gold', 'platinum'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => onUpdateUserTier(selectedUser.email, tier)}
                      className={`py-1.5 rounded-xl font-extrabold text-xs capitalize transition-all border ${
                        selectedUser.profile?.premiumStatus === tier
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-300">Identity Verified Badge</span>
                <button
                  onClick={() => onToggleUserVerified(selectedUser.email, !selectedUser.profile?.isVerified)}
                  className={`py-1 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedUser.profile?.isVerified
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {selectedUser.profile?.isVerified ? 'Verified Active' : 'Grant Verified'}
                </button>
              </div>

              {/* Account Status Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300">Account Safety Status</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdateUserStatus(selectedUser.email, 'active')}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                      (selectedUser.status || 'active') === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => onUpdateUserStatus(selectedUser.email, 'suspended')}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                      selectedUser.status === 'suspended'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => onUpdateUserStatus(selectedUser.email, 'banned')}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                      selectedUser.status === 'banned'
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-900 text-rose-400 border-slate-800 hover:bg-rose-950/30'
                    }`}
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Vault Files */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  Cloud Vault Documents ({selectedUser.fileCount})
                </h4>
              </div>

              {selectedUser.fileCount === 0 ? (
                <div className="p-6 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs italic">
                  User vault is currently empty.
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {selectedUser.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-950/40 hover:bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {getFileIcon(file.type)}
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-slate-200 block truncate" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                            {file.size} • {file.uploadDate.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-3xl">
            <Users className="w-10 h-10 text-slate-600 mb-3" />
            <h3 className="font-bold text-sm text-slate-400">No User Selected</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5">
              Select any profile from the left list to override tier, toggle verified status, or manage account safety.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
