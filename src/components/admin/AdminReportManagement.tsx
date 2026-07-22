import React, { useState } from 'react';
import { Flag, ShieldAlert, CheckCircle2, XCircle, Ban, AlertTriangle, Search, Clock, UserX } from 'lucide-react';
import { AppReport } from '../../types';

interface AdminReportManagementProps {
  reports: AppReport[];
  onDismissReport: (id: string) => void;
  onWarnUser: (report: AppReport) => void;
  onBanUser: (report: AppReport) => void;
}

export default function AdminReportManagement({
  reports,
  onDismissReport,
  onWarnUser,
  onBanUser
}: AdminReportManagementProps) {
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.accusedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rep.reason.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return rep.status === 'pending';
    return rep.status !== 'pending';
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div id="admin-report-management-module" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Safety & Report Management Center
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {pendingCount} Pending Action
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review user-flagged profiles for community guidelines, inappropriate content, or harassment violations.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search accused, reporter or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs">
        {[
          { id: 'pending', label: `Pending Reports (${pendingCount})` },
          { id: 'resolved', label: 'Resolved History' },
          { id: 'all', label: `All Reports (${reports.length})` }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
              filter === f.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">All quiet! No flagged reports matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rep.accusedPhoto}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-500/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        {rep.accusedName}
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono font-bold">
                          Accused Profile
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Reporter: <strong className="text-slate-300">{rep.reporterName}</strong></p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    rep.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                      : rep.status === 'resolved_banned'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : rep.status === 'resolved_warning'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {rep.status.replace('resolved_', '')}
                  </span>
                </div>

                {/* Reason Details Box */}
                <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Violation Category
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">{rep.reason}</p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Reported Date: {new Date(rep.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              {rep.status === 'pending' ? (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onDismissReport(rep.id)}
                    className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => onWarnUser(rep)}
                    className="py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-500/30 transition-colors"
                  >
                    Send Warning
                  </button>
                  <button
                    onClick={() => onBanUser(rep)}
                    className="py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold rounded-xl transition-colors shadow-md shadow-rose-500/10 flex items-center justify-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Ban Profile
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 font-bold italic pt-2 border-t border-slate-800 text-right">
                  Action Taken & Resolved
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
