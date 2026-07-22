import React, { useState } from 'react';
import { MatchProfile, SearchFilters, UserProfile } from '../types';
import { BadgeCheck, Heart, MapPin, Sparkles, Star, SlidersHorizontal, Info, X, Briefcase } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { calculateCompatibilityScore } from '../utils';

interface DiscoverGridProps {
  profiles: MatchProfile[];
  userProfile: UserProfile;
  filters: SearchFilters;
  onOpenFilters: () => void;
  onLike: (profile: MatchProfile) => void;
  onFavorite: (profile: MatchProfile) => void;
  onWink: (profile: MatchProfile) => void;
}

export default function DiscoverGrid({
  profiles,
  userProfile,
  filters,
  onOpenFilters,
  onLike,
  onFavorite,
  onWink
}: DiscoverGridProps) {
  const [selectedProfile, setSelectedProfile] = useState<MatchProfile | null>(null);
  const compatibility = selectedProfile ? calculateCompatibilityScore(userProfile, selectedProfile) : null;

  const activeInterestFilters = filters.interests.length;

  return (
    <div id="discover-grid-container" className="p-4 space-y-4">
      
      {/* Search Actions Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-rose-100/80 shadow-sm">
        <div className="text-left">
          <p className="text-xs text-gray-400 font-medium">Looking for</p>
          <p className="text-sm font-bold text-gray-800 capitalize">
            {filters.gender === 'everyone' ? 'Everyone' : filters.gender === 'female' ? 'Women' : 'Men'} • Ages {filters.ageRange[0]}-{filters.ageRange[1]}
          </p>
        </div>

        <button
          id="discover-filter-trigger-btn"
          onClick={onOpenFilters}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold border border-rose-200 text-rose-500 bg-rose-50/40 hover:bg-rose-50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeInterestFilters > 0 && (
            <span className="bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">
              {activeInterestFilters}
            </span>
          )}
        </button>
      </div>

      {/* Grid Content */}
      {profiles.length > 0 ? (
        <div id="discover-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              id={`discover-card-${profile.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-rose-50 shadow-sm flex flex-col group relative"
            >
              {/* Profile Photo */}
              <div 
                className="h-64 sm:h-72 md:h-80 bg-cover bg-center relative cursor-pointer overflow-hidden"
                style={{ backgroundImage: `url(${profile.photoUrl})` }}
                onClick={() => setSelectedProfile(profile)}
              >
                {/* Match score label */}
                <div className="absolute top-2 left-2 bg-rose-500/95 text-white text-[9px] font-extrabold uppercase py-0.5 px-2 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                  {profile.isOnline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <span>{profile.matchScore}% Match</span>
                </div>

                {/* Quick Info Trigger */}
                <button
                  id={`quick-info-${profile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-all"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bio & Details */}
              <div className="p-3 flex-1 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-gray-900 truncate">{profile.name}, {profile.age}</span>
                    {profile.isVerified && (
                      <BadgeCheck id={`grid-verified-badge-${profile.id}`} className="w-4 h-4 text-sky-400 fill-sky-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{profile.occupation}</p>
                  
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1.5">
                    <MapPin className="w-3 h-3 text-gray-300" />
                    <span>{profile.distance} miles</span>
                  </div>
                </div>

                {/* Small Compact Action Row */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-3 gap-1">
                  {/* Wink */}
                  <button
                    id={`grid-wink-btn-${profile.id}`}
                    onClick={() => onWink(profile)}
                    className={`p-1.5 rounded-full hover:bg-amber-50 text-amber-400 transition-colors ${
                      profile.winkSent ? 'text-amber-500 bg-amber-50' : ''
                    }`}
                    title="Send Wink"
                  >
                    <Sparkles className={`w-4 h-4 ${profile.winkSent ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Favorite */}
                  <button
                    id={`grid-fav-btn-${profile.id}`}
                    onClick={() => onFavorite(profile)}
                    className={`p-1.5 rounded-full hover:bg-yellow-50 text-yellow-400 transition-colors ${
                      profile.isFavorite ? 'text-yellow-500 bg-yellow-50' : ''
                    }`}
                    title="Add to Favorites"
                  >
                    <Star className={`w-4 h-4 ${profile.isFavorite ? 'fill-yellow-500' : ''}`} />
                  </button>

                  {/* Like */}
                  <button
                    id={`grid-like-btn-${profile.id}`}
                    onClick={() => onLike(profile)}
                    className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                    title="Send Like"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Filters State */
        <div id="no-filtered-matches-state" className="bg-white border border-rose-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 py-16">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">No match recommendations</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed px-4 max-w-xs">
              No profiles fit your current combination of filters. Try widening your age range or clearing active interest tags!
            </p>
          </div>
          <button
            id="clear-filters-btn"
            onClick={onOpenFilters}
            className="py-2 px-4 rounded-xl border border-rose-200 text-rose-500 text-xs font-semibold hover:bg-rose-50 transition-colors"
          >
            Adjust Filter Settings
          </button>
        </div>
      )}

      {/* Profile Detail modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div id="detail-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              id="detail-modal-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-rose-50 flex flex-col text-left"
            >
              {/* Banner Image */}
              <div 
                className="h-72 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${selectedProfile.photoUrl})` }}
              >
                {/* Dismiss */}
                <button
                  id="close-details-modal-btn"
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 p-2 bg-black/45 hover:bg-black/60 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Score */}
                <div className="absolute bottom-4 left-4 bg-rose-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md">
                  {selectedProfile.matchScore}% Match Score
                </div>
              </div>

              {/* Info content */}
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedProfile.name}, {selectedProfile.age}</h3>
                      {selectedProfile.isVerified && (
                        <BadgeCheck id={`detail-verified-badge-${selectedProfile.id}`} className="w-6 h-6 text-sky-400 fill-sky-400" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-rose-500 mt-1">{selectedProfile.occupation}</p>
                  </div>
                  {selectedProfile.isOnline ? (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase py-1 px-2.5 rounded-full flex items-center gap-1 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  ) : selectedProfile.lastActive ? (
                    <span className="bg-gray-50 text-gray-400 text-[9px] py-1 px-2 rounded-full border border-gray-100 font-medium">
                      {selectedProfile.lastActive}
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/40">
                  <div className="flex items-start gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Based in <strong>{selectedProfile.location}</strong> ({selectedProfile.distance} miles away)</span>
                  </div>
                  <div className="flex items-start gap-2 col-span-2">
                    <Info className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    <span>Personality style: <strong>{selectedProfile.personality}</strong></span>
                  </div>
                  {selectedProfile.education && (
                    <div className="flex items-start gap-2 col-span-1">
                      <Briefcase className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="truncate">Education: <strong>{selectedProfile.education}</strong></span>
                    </div>
                  )}
                  {selectedProfile.religion && (
                    <div className="flex items-start gap-2 col-span-1">
                      <span className="text-[9px] font-extrabold bg-rose-100 text-rose-600 px-1 py-0.5 rounded-md shrink-0 select-none mt-0.5">REL</span>
                      <span className="truncate">Beliefs: <strong>{selectedProfile.religion}</strong></span>
                    </div>
                  )}
                  {selectedProfile.languages && selectedProfile.languages.length > 0 && (
                    <div className="flex items-start gap-2 col-span-2">
                      <span className="text-[9px] font-extrabold bg-rose-100 text-rose-600 px-1 py-0.5 rounded-md shrink-0 select-none mt-0.5 font-mono">LNG</span>
                      <span className="truncate">Languages: <strong>{selectedProfile.languages.join(', ')}</strong></span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</h4>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{selectedProfile.bio}"
                  </p>
                </div>

                {/* Compatibility Breakdown (JustMeet Sparks Board) */}
                {compatibility && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span>JustMeet Sparks Dashboard</span>
                      </div>
                      <span className="text-xs font-extrabold text-rose-600 bg-white border border-rose-100 px-2.5 py-1 rounded-full shadow-sm">
                        {compatibility.score}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-3 rounded-xl border border-rose-100/30">
                      <div>
                        <p className="text-gray-400 text-[9px] uppercase font-extrabold">Interests Match</p>
                        <p className="font-bold text-gray-800">{compatibility.breakdown.interests} / 15 pts</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px] uppercase font-extrabold">Distance Score</p>
                        <p className="font-bold text-gray-800">{compatibility.breakdown.location} / 15 pts</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px] uppercase font-extrabold">Beliefs Overlap</p>
                        <p className="font-bold text-gray-800">{compatibility.breakdown.religion} / 10 pts</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px] uppercase font-extrabold">Education Fit</p>
                        <p className="font-bold text-gray-800">{compatibility.breakdown.education} / 10 pts</p>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-rose-100/60 pt-2.5">
                      <p className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider">Sparks Highlights</p>
                      <ul className="space-y-1">
                        {compatibility.reasons.map((reason, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-rose-500" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Passions & Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-rose-50 text-rose-600 border border-rose-100 py-1 px-3 rounded-full font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    id={`detail-wink-btn-${selectedProfile.id}`}
                    onClick={() => {
                      onWink(selectedProfile);
                      setSelectedProfile(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-amber-200 text-amber-500 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-50/40 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Wink</span>
                  </button>

                  <button
                    id={`detail-fav-btn-${selectedProfile.id}`}
                    onClick={() => {
                      onFavorite(selectedProfile);
                      setSelectedProfile({ ...selectedProfile, isFavorite: !selectedProfile.isFavorite });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-yellow-200 text-yellow-500 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-yellow-50/40 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${selectedProfile.isFavorite ? 'fill-yellow-500' : ''}`} />
                    <span>Favorite</span>
                  </button>

                  <button
                    id={`detail-like-btn-${selectedProfile.id}`}
                    onClick={() => {
                      onLike(selectedProfile);
                      setSelectedProfile(null);
                    }}
                    className="flex-[2] py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/15 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Connect Now</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
