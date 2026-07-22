import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Search, Eye, AlertTriangle } from 'lucide-react';
import { VerificationRequest } from '../../types';

interface AdminVerificationProps {
  requests: VerificationRequest[];
  onApprove: (req: VerificationRequest) => void;
  onReject: (req: VerificationRequest) => void;
  isRefreshing: boolean;
}

export default function AdminVerification({
  requests,
  onApprove,
  onReject,
  isRefreshing
}: AdminVerificationProps) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = requests.filter(req => {
    const matchesSearch = req.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.profileId.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div id="admin-verification-module" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            Profile Verification Audit Queue
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare live selfie photos side-by-side with profile pictures to grant official verified checkmark badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 text-xs">
        {[
          { id: 'pending', label: `Pending Requests (${pendingCount})` },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'all', label: `All Requests (${requests.length})` }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              filter === f.id
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Request Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">No verification requests found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-white truncate">{req.profileName}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{req.profileId}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    req.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : req.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {/* Side-by-side photo comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profile Photo</span>
                    <div className="aspect-square rounded-xl overflow-hidden ring-1 ring-slate-800 relative bg-slate-900">
                      <img
                        src={req.profilePhoto}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> Live Selfie
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden ring-2 ring-sky-500/40 relative bg-slate-900">
                      <img
                        src={req.selfiePhoto}
                        alt="Live Selfie"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {req.status === 'pending' ? (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onApprove(req)}
                    disabled={isRefreshing}
                    className="py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Badge
                  </button>
                  <button
                    onClick={() => onReject(req)}
                    disabled={isRefreshing}
                    className="py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-300 font-extrabold text-xs rounded-xl border border-rose-900/50 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => req.status === 'approved' ? onReject(req) : onApprove(req)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Switch to {req.status === 'approved' ? 'Rejected' : 'Approved'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
