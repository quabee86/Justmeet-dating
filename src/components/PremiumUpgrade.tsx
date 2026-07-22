import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CreditCard, Shield, BadgeCheck, Check, Sparkles, Lock, RefreshCw, Star, ShieldAlert, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PremiumUpgradeProps {
  profile: UserProfile;
  onUpgrade: (status: 'gold' | 'platinum') => void;
}

export default function PremiumUpgrade({ profile, onUpgrade }: PremiumUpgradeProps) {
  const [selectedTier, setSelectedTier] = useState<'gold' | 'platinum' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plans = [
    {
      id: 'gold' as const,
      name: 'JustMeet Gold',
      price: '$19.99',
      period: 'month',
      color: 'from-amber-500 to-yellow-500',
      tagline: 'The gold standard of dating connections',
      features: [
        'Unlimited Swiping & Matching',
        'Unlimited Messaging (No daily limits!)',
        'Profile Boosts (3 per month included)',
        'Active Read Receipts (Blue double checks)',
        'See Who Visited Your Profile',
        '15 Premium Winks per Day',
        'Gold Badge Profile Highlights'
      ]
    },
    {
      id: 'platinum' as const,
      name: 'JustMeet Platinum',
      price: '$29.99',
      period: 'month',
      color: 'from-slate-800 via-slate-900 to-black',
      tagline: 'Ultimate invisible sovereignty & elite matching',
      features: [
        'All JustMeet Gold Privileges',
        'Anonymous Browsing (Incognito stealth mode)',
        'Advanced Matching Filters unlocked',
        'Infinite Profile Boosts anytime',
        'See Who Liked You instantly',
        'Prioritized swiping queue positioning',
        'Elite Platinum Badge Highlight'
      ]
    }
  ];

  // Simulated credit card input formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setPaymentLoading(true);
    setPaymentStatus('Connecting with secure Stripe gateway...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setPaymentStatus('Transaction Authorized successfully!');
        setTimeout(() => {
          setPaymentLoading(false);
          setPaymentSuccess(true);
          onUpgrade(selectedTier);
        }, 1000);
      } else {
        if (progress > 80) {
          setPaymentStatus('Updating matching ledger parameters...');
        } else if (progress > 50) {
          setPaymentStatus('Checking funds with issuing credit bank...');
        } else if (progress > 25) {
          setPaymentStatus('Processing 3D Secure 2.0 authentications...');
        }
      }
    }, 400);
  };

  const handleReset = () => {
    setSelectedTier(null);
    setPaymentSuccess(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
  };

  return (
    <div id="premium-upgrade-layout" className="p-4 space-y-6 text-left">
      
      {/* Current Status Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your subscription level</p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-gray-900 capitalize flex items-center gap-1.5">
              {profile.premiumStatus === 'free' ? 'Standard Tier (Free)' : `JustMeet ${profile.premiumStatus}`}
              {profile.premiumStatus === 'gold' && <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />}
              {profile.premiumStatus === 'platinum' && <Sparkle className="w-5 h-5 text-slate-800 fill-slate-300 shrink-0" />}
            </h3>
            {profile.premiumStatus !== 'free' && (
              <BadgeCheck className={`w-6 h-6 ${profile.premiumStatus === 'gold' ? 'text-amber-500 fill-amber-100' : 'text-slate-800 fill-slate-100'}`} />
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {profile.premiumStatus === 'free' 
              ? "Gain premium features like unlimited messaging, custom compatibility filters, incognito stealth mode, and read status markers."
              : `You are currently enjoying the premium benefits of our elite ${profile.premiumStatus} membership tier.`}
          </p>
        </div>

        {profile.premiumStatus !== 'free' && (
          <button
            id="downgrade-membership-btn"
            onClick={() => onUpgrade('gold')} // Set default premium toggle
            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded-xl transition-colors"
          >
            Manage Billing
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedTier ? (
          /* List of pricing options cards */
          <motion.div
            key="tiers-list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className="bg-white border-2 border-rose-50 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-rose-200 hover:shadow-md transition-all text-left"
              >
                {/* Visual Accent Banner */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.color}`} />

                {/* Card Title & Pricing info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-lg text-gray-950 flex items-center gap-1.5">
                        {plan.name}
                        {plan.id === 'gold' && <Star className="w-5 h-5 text-amber-500 fill-amber-400" />}
                        {plan.id === 'platinum' && <Sparkle className="w-5 h-5 text-slate-800 fill-slate-300" />}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl font-black text-gray-950">{plan.price}</span>
                    <span className="text-xs text-gray-500">/ {plan.period}</span>
                  </div>

                  {/* Feature comparison checks */}
                  <ul className="space-y-2.5 pt-2 text-left">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
                        <Check className="w-4 h-4 text-emerald-500 stroke-[3px] mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`select-plan-${plan.id}`}
                  onClick={() => setSelectedTier(plan.id)}
                  className={`w-full mt-6 py-3 rounded-2xl bg-gradient-to-r ${plan.color} text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Choose Plan</span>
                </button>
              </div>
            ))}
          </motion.div>
        ) : !paymentSuccess ? (
          /* Stripe Payment Secured Checkout card */
          <motion.div
            key="checkout-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-rose-100 p-6 shadow-xl max-w-md mx-auto space-y-6"
          >
            {/* Checkout Header */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <button
                id="checkout-back-btn"
                onClick={handleReset}
                className="text-xs font-bold text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-1"
              >
                ← Change Plan
              </button>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Stripe Secured Portal</span>
              </div>
            </div>

            <div className="space-y-1 bg-rose-50/20 p-4 rounded-2xl border border-rose-100/30 text-center">
              <span className="text-xs text-gray-500 font-semibold block">Upgrade membership to</span>
              <span className="font-extrabold text-lg text-rose-600 block">
                {selectedTier === 'gold' ? 'JustMeet Gold' : 'JustMeet Platinum'}
              </span>
              <span className="text-2xl font-black text-gray-900 block mt-1">
                {selectedTier === 'gold' ? '$19.99' : '$29.99'} <span className="text-xs text-gray-500 font-normal">/ month</span>
              </span>
            </div>

            {/* Credit Card Input Form */}
            <form id="payment-stripe-form" onSubmit={handleCheckout} className="space-y-4">
              {/* Cardholder Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                <input
                  id="card-name-input"
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:border-rose-300 focus:outline-none placeholder-gray-300"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Credit Card Number</label>
                <div className="relative">
                  <input
                    id="card-number-input"
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 pr-10 text-sm focus:border-rose-300 focus:outline-none placeholder-gray-300 font-mono"
                  />
                  <CreditCard className="w-5 h-5 text-gray-300 absolute right-3 top-3" />
                </div>
              </div>

              {/* Expiry and CVC row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Expiration Date</label>
                  <input
                    id="card-expiry-input"
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:border-rose-300 focus:outline-none placeholder-gray-300 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">CVV/CVC</label>
                  <input
                    id="card-cvc-input"
                    type="password"
                    required
                    placeholder="123"
                    maxLength={3}
                    value={cardCvc}
                    onChange={handleCvcChange}
                    className="w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm focus:border-rose-300 focus:outline-none placeholder-gray-300 font-mono text-center"
                  />
                </div>
              </div>

              {/* Secure payment shield notice */}
              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>PCI-DSS compliant SSL encryption. Powered by Stripe checkout.</span>
              </div>

              {/* Payment Loading overlay */}
              {paymentLoading ? (
                <div id="payment-scanning" className="space-y-2 py-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                    <span>{paymentStatus}</span>
                  </div>
                </div>
              ) : (
                <button
                  id="checkout-pay-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-lg shadow-rose-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize Secure Charge</span>
                </button>
              )}
            </form>
          </motion.div>
        ) : (
          /* Payment Success Celebration Stage */
          <motion.div
            key="success-celebrate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xl max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in-95"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500 border-2 border-emerald-100">
              <BadgeCheck className="w-10 h-10 fill-emerald-50" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">Payment Success! 🎉</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Thank you for subscribing! Your account is upgraded to <strong>JustMeet {selectedTier === 'gold' ? 'Gold' : 'Platinum'}</strong>. Your premium superpowers are activated globally!
              </p>
            </div>

            <button
              id="checkout-success-btn"
              onClick={handleReset}
              className="py-2.5 px-6 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              Continue Swiping
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
