import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Eye, MousePointer, ExternalLink, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Advertisement } from '../../types';

interface AdminAdsManagementProps {
  ads: Advertisement[];
  onToggleAdActive: (id: string) => void;
  onAddAd: (newAd: Omit<Advertisement, 'id' | 'clicks' | 'impressions'>) => void;
  onDeleteAd: (id: string) => void;
}

export default function AdminAdsManagement({
  ads,
  onToggleAdActive,
  onAddAd,
  onDeleteAd
}: AdminAdsManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600');
  const [targetUrl, setTargetUrl] = useState('https://justmeetdating.com');

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const handleSubmitNewAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    onAddAd({
      title,
      description,
      imageUrl,
      targetUrl,
      isActive: true
    });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div id="admin-ads-module" className="space-y-6 text-left">
      {/* Header & Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-500" />
            In-App Advertisements & Sponsorship Campaigns
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage banner placements, track ad impressions, CTR performance, and partner promotions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Ad Campaign
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Impressions</span>
            <h3 className="text-xl font-extrabold text-white">{totalImpressions.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <MousePointer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Clicks</span>
            <h3 className="text-xl font-extrabold text-white">{totalClicks.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Average CTR Rate</span>
            <h3 className="text-xl font-extrabold text-white">{avgCTR}%</h3>
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ads.map((ad) => {
          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
          return (
            <div
              key={ad.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <img
                    src={ad.imageUrl}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-800 shrink-0 bg-slate-950"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-white truncate">{ad.title}</h3>
                      <button
                        onClick={() => onToggleAdActive(ad.id)}
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border transition-all ${
                          ad.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Paused'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{ad.description}</p>
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 mt-1 font-mono truncate"
                    >
                      <ExternalLink className="w-3 h-3" /> {ad.targetUrl}
                    </a>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-2xl text-center text-xs font-bold border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">Impressions</span>
                    <span className="text-white mt-0.5 block">{ad.impressions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">Clicks</span>
                    <span className="text-emerald-400 mt-0.5 block">{ad.clicks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">CTR Rate</span>
                    <span className="text-amber-400 mt-0.5 block">{ctr}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-500">Ad ID: <strong className="font-mono">{ad.id}</strong></span>
                <button
                  onClick={() => onDeleteAd(ad.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Delete Campaign"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE AD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-500" />
                Launch New Ad Campaign
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewAd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Dinner Dates Partner Promo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Description / Tagline</label>
                <textarea
                  placeholder="e.g. Get 20% off fine dining experience on your first match date!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 h-20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Image Banner URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Target Destination Link</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
