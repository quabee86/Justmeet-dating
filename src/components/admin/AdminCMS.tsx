import React, { useState } from 'react';
import { Newspaper, Megaphone, ShieldCheck, Plus, Trash2, Edit3, Save, CheckCircle2 } from 'lucide-react';
import { CMSArticle } from '../../types';

interface AdminCMSProps {
  articles: CMSArticle[];
  broadcastBanner: string;
  onUpdateBroadcastBanner: (msg: string) => void;
  onAddArticle: (article: Omit<CMSArticle, 'id' | 'lastUpdated'>) => void;
  onDeleteArticle: (id: string) => void;
}

export default function AdminCMS({
  articles,
  broadcastBanner,
  onUpdateBroadcastBanner,
  onAddArticle,
  onDeleteArticle
}: AdminCMSProps) {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'articles' | 'legal'>('broadcast');
  const [announcementText, setAnnouncementText] = useState(broadcastBanner);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // New Article Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'safety' | 'guidelines' | 'faq' | 'tips'>('tips');
  const [newContent, setNewContent] = useState('');

  // Terms / Privacy policies state
  const [termsContent, setTermsContent] = useState(
    "JustMeet Dating Service Terms of Use\n\n1. Community Guidelines: Be respectful, kind, and polite to all members.\n2. Verification Policy: Identity selfies must match profile images.\n3. Zero Harassment Tolerance: Immediate bans issued for hate speech or scams."
  );

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBroadcastBanner(announcementText);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleAddArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddArticle({
      title: newTitle,
      category: newCategory,
      content: newContent
    });
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div id="admin-cms-module" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-rose-500" />
            Content Management System (CMS)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage global broadcast announcements, dating tips, safety guidelines, and legal policies.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 text-xs">
          {[
            { id: 'broadcast', label: 'In-App Announcement' },
            { id: 'articles', label: `Articles (${articles.length})` },
            { id: 'legal', label: 'Legal Policies' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. BROADCAST ANNOUNCEMENT TAB */}
      {activeTab === 'broadcast' && (
        <form onSubmit={handleSaveBanner} className="space-y-4 max-w-2xl">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-rose-400 uppercase tracking-wider">
              <Megaphone className="w-4 h-4" /> Global Top App Announcement Banner
            </div>
            <p className="text-xs text-slate-300">
              This message will display as a prominent marquee banner across the top header for all logged-in members.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. 💕 Valentine Special: Upgrade to Gold VIP for 50% off!"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="py-2.5 px-5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Broadcast Announcement
            </button>
            {isSavedBanner && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Live Broadcast Updated!
              </span>
            )}
          </div>
        </form>
      )}

      {/* 2. DATING TIPS & ARTICLES TAB */}
      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Article List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Published Articles & Guides</h3>
            <div className="space-y-3">
              {articles.map((art) => (
                <div key={art.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 relative group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {art.category}
                    </span>
                    <button
                      onClick={() => onDeleteArticle(art.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">{art.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3">{art.content}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">Updated: {art.lastUpdated}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Article Form */}
          <form onSubmit={handleAddArticleSubmit} className="lg:col-span-5 p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3.5 text-xs">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" /> Publish New Safety / Tip Article
            </h3>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Article Title</label>
              <input
                type="text"
                placeholder="e.g. 5 First Date Safety Rules"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="safety">Safety Guidelines</option>
                <option value="tips">Dating Tips</option>
                <option value="faq">FAQ</option>
                <option value="guidelines">Community Rules</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Article Content</label>
              <textarea
                placeholder="Write article details..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500 h-28"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 transition-all"
            >
              Publish Article
            </button>
          </form>
        </div>
      )}

      {/* 3. LEGAL POLICIES TAB */}
      {activeTab === 'legal' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Terms of Service & Privacy Policy Document Editor
            </h3>
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500 h-48"
            />
          </div>

          <button
            onClick={() => alert("Terms of Service saved!")}
            className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Legal Terms
          </button>
        </div>
      )}
    </div>
  );
}
