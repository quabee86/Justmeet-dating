import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchProfile, UserProfile } from '../types';
import { Heart, X, Star, Sparkles, MapPin, Briefcase, BadgeCheck, RotateCcw } from 'lucide-react';
import { calculateCompatibilityScore } from '../utils';

interface SwipeDeckProps {
  profiles: MatchProfile[];
  userProfile: UserProfile;
  onLike: (profile: MatchProfile) => void;
  onDislike: (profile: MatchProfile) => void;
  onWink: (profile: MatchProfile) => void;
  onFavorite: (profile: MatchProfile) => void;
  onReset: () => void;
}

export default function SwipeDeck({
  profiles,
  userProfile,
  onLike,
  onDislike,
  onWink,
  onFavorite,
  onReset
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const activeProfile = currentIndex < profiles.length ? profiles[currentIndex] : null;
  const compatibility = activeProfile ? calculateCompatibilityScore(userProfile, activeProfile) : null;

  const handleDislike = () => {
    if (!activeProfile) return;
    setSwipeDirection('left');
    setTimeout(() => {
      onDislike(activeProfile);
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleLike = () => {
    if (!activeProfile) return;
    setSwipeDirection('right');
    setTimeout(() => {
      onLike(activeProfile);
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleWink = () => {
    if (!activeProfile) return;
    onWink(activeProfile);
    // Visual winking indicator then automatic like!
    setSwipeDirection('right');
    setTimeout(() => {
      onLike(activeProfile);
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 400);
  };

  const handleFavoriteClick = () => {
    if (!activeProfile) return;
    onFavorite(activeProfile);
  };

  // Drag handlers for mobile/mouse swiping
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      handleLike();
    } else if (info.offset.x < -threshold) {
      handleDislike();
    }
  };

  return (
    <div id="swipe-deck-container" className="flex flex-col items-center justify-center h-full w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto p-2 sm:p-4 select-none">
      <AnimatePresence mode="wait">
        {activeProfile ? (
          <div key={activeProfile.id} id={`swipe-profile-${activeProfile.id}`} className="w-full flex flex-col gap-6 h-[600px] sm:h-[660px] md:h-[720px] lg:h-[780px] relative">
            
            {/* Card Stack */}
            <div className="flex-1 relative w-full rounded-3xl overflow-hidden shadow-2xl border border-rose-100 bg-white">
              
              {/* Back Card Preview (for visual depth) */}
              {currentIndex + 1 < profiles.length && (
                <div 
                  className="absolute inset-0 scale-[0.96] translate-y-3 opacity-40 rounded-3xl overflow-hidden border border-rose-50 blur-[1px] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(${profiles[currentIndex + 1].photoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {/* Main Active Card */}
              <motion.div
                id={`card-${activeProfile.id}`}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={
                  swipeDirection === 'left' ? { x: -400, y: 50, rotate: -20, opacity: 0 } :
                  swipeDirection === 'right' ? { x: 400, y: 50, rotate: 20, opacity: 0 } :
                  { x: 0, y: 0, rotate: 0, opacity: 1 }
                }
                transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing flex flex-col justify-end p-6 md:p-8 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 75%), url(${activeProfile.photoUrl})`,
                }}
              >
                {/* LIKE / NOPE visual badges when dragging */}
                <div className="absolute top-8 right-8 rotate-12 border-4 border-emerald-500 text-emerald-500 font-extrabold text-xl py-1 px-4 rounded-xl opacity-0 hover:opacity-100 transition-opacity uppercase tracking-wider select-none pointer-events-none">
                  LIKE
                </div>
                <div className="absolute top-8 left-8 -rotate-12 border-4 border-rose-500 text-rose-500 font-extrabold text-xl py-1 px-4 rounded-xl opacity-0 hover:opacity-100 transition-opacity uppercase tracking-wider select-none pointer-events-none">
                  NOPE
                </div>

                {/* Profile Details Overlay */}
                <div className="text-white space-y-3 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight">{activeProfile.name}, {activeProfile.age}</span>
                    {activeProfile.isVerified && (
                      <BadgeCheck id={`verified-badge-${activeProfile.id}`} className="w-6 h-6 text-sky-400 fill-sky-400" />
                    )}
                    {activeProfile.isOnline && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" title="Online now" />
                    )}
                    <span className="ml-auto bg-rose-500/90 text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-full backdrop-blur-sm">
                      {compatibility?.score ?? activeProfile.matchScore}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-white/90">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 opacity-80 shrink-0" />
                      <span className="truncate">{activeProfile.occupation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 opacity-80 shrink-0" />
                      <span className="truncate">{activeProfile.location} • {activeProfile.distance} mi</span>
                    </div>
                    {activeProfile.education && (
                      <div className="flex items-center gap-1.5 col-span-1">
                        <span className="text-[9px] font-extrabold bg-white/20 text-white px-1 py-0.5 rounded shrink-0 select-none">EDU</span>
                        <span className="truncate">{activeProfile.education}</span>
                      </div>
                    )}
                    {activeProfile.religion && (
                      <div className="flex items-center gap-1.5 col-span-1">
                        <span className="text-[9px] font-extrabold bg-white/20 text-white px-1 py-0.5 rounded shrink-0 select-none">REL</span>
                        <span className="truncate">{activeProfile.religion}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-white/95 line-clamp-2 italic">
                    "{activeProfile.bio}"
                  </p>

                  {/* Compatibility Highlights (Sparks) */}
                  {compatibility && compatibility.reasons.length > 0 && (
                    <div className="bg-rose-500/15 border border-rose-500/20 rounded-xl p-2 backdrop-blur-md space-y-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-rose-300 font-extrabold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-rose-300 animate-pulse" />
                        <span>JustMeet Sparks</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {compatibility.reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[10px] text-white/90 truncate">
                            <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                            <span className="truncate">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests Preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeProfile.interests.slice(0, 3).map((interest) => (
                      <span 
                        key={interest} 
                        className="text-[9px] bg-white/20 hover:bg-white/30 transition-colors py-0.5 px-2 rounded-full backdrop-blur-md text-white font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                    {activeProfile.interests.length > 3 && (
                      <span className="text-[9px] bg-white/10 py-0.5 px-2 rounded-full backdrop-blur-md text-white">
                        +{activeProfile.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tactical Control Buttons */}
            <div id="deck-action-buttons" className="flex items-center justify-between px-4">
              {/* Reset/Rewind */}
              <button
                id="deck-rewind-btn"
                onClick={() => {
                  if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
                }}
                disabled={currentIndex === 0}
                className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Rewind Swipe"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Dislike */}
              <button
                id="deck-dislike-btn"
                onClick={handleDislike}
                className="w-14 h-14 rounded-full bg-white border-2 border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all"
                title="Pass"
              >
                <X className="w-7 h-7" />
              </button>

              {/* Wink */}
              <button
                id="deck-wink-btn"
                onClick={handleWink}
                className={`w-11 h-11 rounded-full bg-white border border-amber-100 flex items-center justify-center hover:bg-amber-50 active:scale-95 transition-all ${
                  activeProfile.winkSent ? 'text-amber-500' : 'text-amber-400 hover:text-amber-500'
                }`}
                title="Send Wink"
              >
                <Sparkles className={`w-5 h-5 ${activeProfile.winkSent ? 'fill-amber-500' : ''}`} />
              </button>

              {/* Favorite */}
              <button
                id="deck-favorite-btn"
                onClick={handleFavoriteClick}
                className={`w-11 h-11 rounded-full bg-white border border-yellow-100 flex items-center justify-center hover:bg-yellow-50 active:scale-95 transition-all ${
                  activeProfile.isFavorite ? 'text-yellow-500' : 'text-yellow-400 hover:text-yellow-500'
                }`}
                title="Add to Favorites"
              >
                <Star className={`w-5 h-5 ${activeProfile.isFavorite ? 'fill-yellow-500' : ''}`} />
              </button>

              {/* Like */}
              <button
                id="deck-like-btn"
                onClick={handleLike}
                className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 transition-all"
                title="Like"
              >
                <Heart className="w-7 h-7 fill-white" />
              </button>
            </div>

          </div>
        ) : (
          /* Empty Deck State */
          <motion.div 
            id="out-of-swipes-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white border border-rose-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-6 h-[480px] shadow-xl"
          >
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-100 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">You've reached the end!</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed px-4">
                No more matches fit your current filters. Try expanding your search criteria or reset your deck to swipe again!
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
              <button
                id="reset-swipes-btn"
                onClick={() => {
                  setCurrentIndex(0);
                  onReset();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-all shadow-md shadow-rose-500/10 active:scale-95"
              >
                Reset Swipes Deck
              </button>
              <button
                id="upgrade-swipes-btn"
                onClick={() => {
                  // Direct tab change to premium handled in parent
                  const btn = document.getElementById('tab-btn-premium');
                  if (btn) btn.click();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                Unlock Unlimited Swipes ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
