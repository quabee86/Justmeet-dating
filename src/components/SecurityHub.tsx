import React, { useState } from 'react';
import { 
  KeyRound, ShieldCheck, RefreshCw, Lock, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { UserProfile, Chat, PaymentTransaction } from '../types';

interface SecurityHubProps {
  userProfile: UserProfile;
  chats: Chat[];
  transactions: PaymentTransaction[];
  onUpdateUserProfile: (profile: UserProfile) => void;
  onAddToast: (type: 'system' | 'match' | 'message', title: string, description: string) => void;
  onDeleteAccount: () => void;
}

export default function SecurityHub({ 
  userProfile, onAddToast
}: SecurityHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'hashing' | 'totp'>('hashing');

  // 1. Password hashing state
  const [passwordInput, setPasswordInput] = useState('Pass123!Secure');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashedOutput, setHashedOutput] = useState<{ hash: string; salt: string; elapsedMs: number } | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // 2. Two-factor auth state
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrUrl, setTotpQrUrl] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [isTotpVerified, setIsTotpVerified] = useState(false);
  const [totpError, setTotpError] = useState('');
  const [isSettingUpTotp, setIsSettingUpTotp] = useState(false);

  // Password Hashing Handler
  const handleHashPassword = async () => {
    setIsHashing(true);
    setHashedOutput(null);
    try {
      const res = await fetch('/api/security/hash-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, rounds: saltRounds })
      });
      if (res.ok) {
        const data = await res.json();
        setHashedOutput(data);
        onAddToast('system', 'Bcrypt Hash Computed 🔒', `Password hashed successfully with ${saltRounds} rounds!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsHashing(false);
    }
  };

  // 2FA Setup Handler
  const handleStartTotpSetup = async () => {
    setIsSettingUpTotp(true);
    try {
      const res = await fetch('/api/security/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kwabenaprempeh86@gmail.com' })
      });
      if (res.ok) {
        const data = await res.json();
        setTotpSecret(data.secret);
        setTotpQrUrl(data.qrCodeUrl);
        setPairingCode(data.pairingCode);
        onAddToast('system', '2FA Vault Prepared 🔑', 'TOTP cryptographic pairing seed created.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettingUpTotp(false);
    }
  };

  // 2FA Code Verification
  const handleVerifyTotpCode = async () => {
    setTotpError('');
    try {
      const res = await fetch('/api/security/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCodeInput, secret: totpSecret, email: 'kwabenaprempeh86@gmail.com' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsTotpVerified(true);
          onAddToast('system', '2FA Active Shield Activated 🛡️', 'Authentic token validated. 2FA is active on account.');
        } else {
          setTotpError(data.error);
          onAddToast('system', 'Token Verification Failed ✗', 'Code expired or incorrect secret syncing.');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Password Strength helper
  const getPasswordStrength = () => {
    if (passwordInput.length < 6) return { label: 'Extremely Weak', color: 'bg-red-500 w-1/4' };
    const hasNum = /\d/.test(passwordInput);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordInput);
    const hasUpper = /[A-Z]/.test(passwordInput);
    
    let score = 1;
    if (hasNum) score++;
    if (hasSpecial) score++;
    if (hasUpper) score++;
    
    if (score === 2) return { label: 'Medium Safety', color: 'bg-amber-400 w-2/4' };
    if (score === 3) return { label: 'Strong Security', color: 'bg-emerald-500 w-3/4' };
    if (score === 4) return { label: 'Military Grade', color: 'bg-sky-500 w-full' };
    return { label: 'Weak', color: 'bg-red-400 w-2/5' };
  };

  return (
    <div id="security-hub-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      
      {/* Sidebar Tab Switches */}
      <div className="lg:col-span-1 space-y-2 flex flex-col">
        {[
          { id: 'hashing', label: 'Bcrypt Password Hashing', icon: KeyRound },
          { id: 'totp', label: 'Two-Factor Auth (2FA)', icon: ShieldCheck }
        ].map(sub => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              id={`security-sublink-${sub.id}`}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 font-bold text-xs transition-all ${
                isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'bg-white text-gray-700 hover:bg-rose-50/20 border border-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-rose-100 shadow-sm p-6 overflow-hidden">
        
        {/* TAB 1: BCRYPT HASHING */}
        {activeSubTab === 'hashing' && (
          <div id="subtab-hashing" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-500" />
                Password Hashing (Blowfish Bcrypt)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Protect passwords with salted hashes utilizing standard Blowfish encryption algorithms natively on our server.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Plaintext Password input</label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none"
                  placeholder="Enter secure password..."
                />
              </div>

              {/* Password strength */}
              <div>
                <div className="flex justify-between text-[11px] text-gray-400 font-bold uppercase mb-1">
                  <span>Local Password Assessment</span>
                  <span className="text-rose-500 font-black">{getPasswordStrength().label}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrength().color}`} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  <span>Bcrypt Cost Metric (Salt Rounds)</span>
                  <span className="text-rose-500 font-black">{saltRounds} Rounds ({Math.pow(2, saltRounds).toLocaleString()} iterations)</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  value={saltRounds}
                  onChange={(e) => setSaltRounds(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Rounds above 12 increase calculation difficulty and latency to thwart brute force bot attacks.</span>
              </div>

              <button
                id="hash-btn"
                onClick={handleHashPassword}
                disabled={isHashing}
                className="w-full bg-rose-500 hover:bg-rose-600 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                {isHashing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isHashing ? 'Computing crypt hash on backend...' : 'Execute Bcrypt Hashing Algorithm'}
              </button>

              {hashedOutput && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 font-mono text-xs text-gray-700 animate-fadeIn">
                  <div className="flex justify-between border-b border-gray-200/50 pb-2">
                    <span className="font-bold text-gray-400">Salt prefix:</span>
                    <span className="text-rose-600 select-all font-bold">{hashedOutput.salt}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-gray-400 block">Computed Hash Buffer ($2a$):</span>
                    <p className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 select-all font-bold text-gray-800 break-all leading-relaxed">
                      {hashedOutput.hash}
                    </p>
                  </div>
                  <div className="flex justify-between pt-1 text-[10px] text-gray-400">
                    <span>Algorithm: Blowfish crypt-adaptive</span>
                    <span>Computation Latency: {hashedOutput.elapsedMs}ms</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TWO FACTOR AUTHENTICATION */}
        {activeSubTab === 'totp' && (
          <div id="subtab-totp" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                Two-Factor Authenticator Lock (2FA TOTP)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Secure your login with actual cryptographic time-stepped HMAC tokens compatible with Google Authenticator, Microsoft Authenticator, and Authy.
              </p>
            </div>

            {!totpSecret ? (
              <div className="p-8 border border-dashed border-rose-100 rounded-3xl bg-rose-50/10 text-center space-y-4">
                <Lock className="w-10 h-10 text-rose-400 mx-auto" />
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="font-extrabold text-sm text-gray-900">Activate Two-Factor Lock</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Protect your profile against credential theft. Once activated, matches and private messages can only be adjusted after verifying your authenticator app's numeric keys.
                  </p>
                </div>
                <button
                  id="start-totp-btn"
                  onClick={handleStartTotpSetup}
                  disabled={isSettingUpTotp}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 mx-auto"
                >
                  {isSettingUpTotp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Set Up Google Authenticator
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-fadeIn">
                
                {/* Left - QR code scan */}
                <div className="space-y-4 text-center md:text-left bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center md:items-start">
                  <h4 className="font-extrabold text-xs text-rose-500 uppercase tracking-widest">Step 1: Scan QR Code</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Open Google Authenticator on your mobile device, choose <strong>Scan a QR Code</strong>, and scan the image below:
                  </p>
                  
                  {totpQrUrl && (
                    <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block shadow-sm">
                      <img
                        src={totpQrUrl}
                        alt="2FA QR Code"
                        className="w-40 h-40 object-contain block"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="text-left w-full space-y-1 font-mono text-[10px] text-gray-600">
                    <span className="font-bold text-gray-400 block">Or enter pairing seed key manually:</span>
                    <span className="bg-white p-1.5 px-2.5 rounded border border-gray-200 font-extrabold text-gray-800 tracking-wider inline-block select-all">
                      {pairingCode}
                    </span>
                  </div>
                </div>

                {/* Right - Token verification */}
                <div className="space-y-4 bg-white p-5 border border-rose-100 rounded-2xl shadow-sm text-center md:text-left flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-rose-500 uppercase tracking-widest">Step 2: Enter OTP Code</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Enter the 6-digit verification code generated inside your authenticator app under your <strong>JustMeet</strong> credential block:
                    </p>

                    <input
                      type="text"
                      maxLength={6}
                      value={totpCodeInput}
                      onChange={(e) => setTotpCodeInput(e.target.value.replace(/\s/g, ''))}
                      className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none"
                      placeholder="000000"
                    />

                    {totpError && (
                      <p className="text-[10px] font-bold text-red-500 leading-snug flex items-center justify-center md:justify-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{totpError}</span>
                      </p>
                    )}

                    {isTotpVerified && (
                      <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold justify-center md:justify-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Active Shield Guard Engaged ✓</span>
                      </div>
                    )}
                  </div>

                  <button
                    id="verify-totp-btn"
                    onClick={handleVerifyTotpCode}
                    disabled={isTotpVerified || totpCodeInput.length < 6}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isTotpVerified ? '2FA Protection Activated' : 'Validate Authenticator Code'}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
