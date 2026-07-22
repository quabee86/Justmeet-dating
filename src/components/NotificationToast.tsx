import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, MessageSquare, Star, Sparkles, X, User } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'match' | 'message' | 'wink' | 'visitor' | 'system';
  title: string;
  description: string;
  photoUrl?: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  return (
    <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            id={`toast-${toast.id}`}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-rose-100 p-4 flex gap-3 relative overflow-hidden"
          >
            {/* Top colored accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              toast.type === 'match' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
              toast.type === 'message' ? 'bg-indigo-500' :
              toast.type === 'wink' ? 'bg-amber-500' :
              toast.type === 'visitor' ? 'bg-teal-500' : 'bg-gray-500'
            }`} />

            {/* Avatar or Icon */}
            <div className="flex-shrink-0 mt-1">
              {toast.photoUrl ? (
                <img
                  src={toast.photoUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  toast.type === 'match' ? 'bg-rose-50' :
                  toast.type === 'message' ? 'bg-indigo-50' :
                  toast.type === 'wink' ? 'bg-amber-50' :
                  toast.type === 'visitor' ? 'bg-teal-50' : 'bg-gray-50'
                }`}>
                  {toast.type === 'match' && <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />}
                  {toast.type === 'message' && <MessageSquare className="w-5 h-5 text-indigo-500" />}
                  {toast.type === 'wink' && <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />}
                  {toast.type === 'visitor' && <User className="w-5 h-5 text-teal-500" />}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {toast.title}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {toast.description}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              id={`toast-dismiss-${toast.id}`}
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors self-start p-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
