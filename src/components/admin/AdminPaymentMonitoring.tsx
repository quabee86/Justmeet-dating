import React, { useState } from 'react';
import { CreditCard, DollarSign, Search, FileDown, CheckCircle2, Clock, XCircle, RefreshCcw } from 'lucide-react';
import { PaymentTransaction } from '../../types';

interface AdminPaymentMonitoringProps {
  transactions: PaymentTransaction[];
  onRefundTransaction: (id: string) => void;
}

export default function AdminPaymentMonitoring({
  transactions,
  onRefundTransaction
}: AdminPaymentMonitoringProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'succeeded' | 'pending' | 'failed' | 'refunded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const grossRevenue = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const csvHeader = "Transaction ID,User Name,User Email,Tier,Amount,Status,Date\n";
    const csvRows = transactions.map(t => `${t.id},"${t.userName}",${t.userEmail},${t.tier},${t.amount},${t.status},${t.timestamp}`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JustMeet_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div id="admin-payment-module" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Real-Time Financial Payment Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit VIP subscription payments, process instant simulation refunds, and export financial CSV reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2 shrink-0"
        >
          <FileDown className="w-4 h-4" /> Export Financial Report (.CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Succeeded Revenue</span>
            <h3 className="text-xl font-extrabold text-white">${grossRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Transactions</span>
            <h3 className="text-xl font-extrabold text-white">{transactions.length}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Refunded Volume</span>
            <h3 className="text-xl font-extrabold text-white">
              {transactions.filter(t => t.status === 'refunded').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter pills */}
        <div className="flex gap-2 text-xs flex-wrap">
          {[
            { id: 'all', label: `All (${transactions.length})` },
            { id: 'succeeded', label: 'Succeeded' },
            { id: 'pending', label: 'Pending' },
            { id: 'failed', label: 'Failed' },
            { id: 'refunded', label: 'Refunded' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id as any)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                filterStatus === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transaction ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <th className="p-3.5">Transaction ID</th>
                <th className="p-3.5">Member Details</th>
                <th className="p-3.5">Plan & Amount</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-mono text-slate-300 select-all font-bold">{t.id}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{t.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.userEmail}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-extrabold text-white text-sm">${t.amount.toFixed(2)}</span>
                    <span className={`ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      t.tier === 'platinum' ? 'bg-purple-500/20 text-purple-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.tier}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {t.cardBrand} •••• {t.last4}
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      t.status === 'succeeded'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : t.status === 'refunded'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {t.status === 'succeeded' ? (
                      <button
                        onClick={() => onRefundTransaction(t.id)}
                        className="py-1 px-3 bg-slate-800 hover:bg-rose-950/40 text-rose-300 text-[11px] font-bold rounded-xl border border-rose-900/40 transition-colors"
                      >
                        Process Refund
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
