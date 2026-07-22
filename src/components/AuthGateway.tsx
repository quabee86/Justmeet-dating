import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, Sparkles, User, Lock, Mail, Eye, EyeOff, 
  Cake, Compass, MapPin, Briefcase, Tag, AlertCircle, 
  Check, Volume2, VolumeX, ShieldCheck, Upload, Camera, RefreshCw, Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVAILABLE_INTERESTS } from '../mockData';
import { playSound } from '../utils/audio';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db, storage, handleFirestoreError, getFirestoreQuotaExceeded } from '../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';


interface AuthGatewayProps {
  onLoginSuccess: (userProfile: UserProfile, accountEmail: string) => void;
  audioMuted: boolean;
  onToggleMute: () => void;
}

export default function AuthGateway({ onLoginSuccess, audioMuted, onToggleMute }: AuthGatewayProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('kwabenaprempeh86@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form states
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState(24);
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('female');
  const [regLookingFor, setRegLookingFor] = useState<'male' | 'female' | 'everyone'>('male');
  const [regLocation, setRegLocation] = useState('Downtown District');
  const [regOccupation, setRegOccupation] = useState('Designer');
  const [regBio, setRegBio] = useState('Spontaneous and cheerful soul looking for meaningful connections!');
  const [regPhotoUrl, setRegPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
  const [regInterests, setRegInterests] = useState<string[]>(['Coffee', 'Art', 'Music']);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fast, secure offline-friendly profile picture loader
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setRegPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };


  // Handle interest toggling during registration
  const toggleInterest = (interest: string) => {
    if (regInterests.includes(interest)) {
      setRegInterests(regInterests.filter(i => i !== interest));
    } else {
      setRegInterests([...regInterests, interest]);
    }
    playSound('message');
  };

  const getSavedUsers = (): any[] => {
    try {
      const stored = localStorage.getItem('justmeet_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUserToStorage = (user: any) => {
    try {
      const current = getSavedUsers();
      localStorage.setItem('justmeet_registered_users', JSON.stringify([...current, user]));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailClean = loginEmail.trim().toLowerCase();
    const passClean = loginPassword;

    if (!emailClean || !passClean) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Dynamic helper to try local storage credentials or default admin credential fallback
    const tryLocalLogin = () => {
      const users = getSavedUsers();
      const foundLocal = users.find(u => u.email.toLowerCase() === emailClean && u.password === passClean);
      
      if (foundLocal) {
        setSuccessMsg('Signed in successfully! Connecting sparks...');
        playSound('match');
        setTimeout(() => {
          onLoginSuccess(foundLocal.profile, emailClean);
        }, 700);
        return true;
      }
      
      // Admin credential local bypass
      if (emailClean === 'kwabenaprempeh86@gmail.com' && passClean === 'password123') {
        const adminDefaultProfile: UserProfile = {
          name: "Kwabena Prempeh",
          age: 25,
          gender: 'male',
          bio: "Passionate about travel blogger spots, live acoustic sessions, and coding up creative products. Let's find the best coffee in the city! ☕️",
          location: "Downtown District",
          occupation: "Software Engineer",
          interests: ["Coffee", "Code", "Music", "Wine", "Travel"],
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
          isVerified: true,
          premiumStatus: 'free',
          lookingFor: 'female',
          ageRangeMin: 18,
          ageRangeMax: 35,
          religion: "None / Agnostic",
          education: "Bachelor's Degree",
          languages: ["English", "Spanish"],
          createdAt: "2026-07-21"
        };
        setSuccessMsg('Signed in successfully! Connecting sparks...');
        playSound('match');
        setTimeout(() => {
          onLoginSuccess(adminDefaultProfile, emailClean);
        }, 700);
        return true;
      }
      return false;
    };

    try {
      setSuccessMsg('Verifying credentials...');
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, emailClean, passClean);
      } catch (authErr: any) {
        if (emailClean === 'kwabenaprempeh86@gmail.com' && passClean === 'password123') {
          try {
            setSuccessMsg('Provisioning default Admin account...');
            userCredential = await createUserWithEmailAndPassword(auth, emailClean, passClean);
          } catch (createErr) {
            console.warn("Firebase provisioning failed, falling back to local sign in:", createErr);
            if (tryLocalLogin()) return;
            throw authErr;
          }
        } else {
          console.warn("Firebase Auth failure, attempting local fallback:", authErr);
          if (tryLocalLogin()) return;
          throw authErr;
        }
      }

      // Load Profile from Firestore if quota available
      let finalProfile: UserProfile;
      try {
        if (getFirestoreQuotaExceeded()) {
          throw new Error("Quota exceeded fallback");
        }
        const docSnap = await getDoc(doc(db, "users", emailClean));
        if (docSnap.exists() && docSnap.data().userProfile) {
          finalProfile = docSnap.data().userProfile;
        } else {
          throw new Error("Missing document profile");
        }
      } catch (dbErr) {
        handleFirestoreError(dbErr, "AuthGateway profile fetch");
        const users = getSavedUsers();
        const foundLocal = users.find(u => u.email.toLowerCase() === emailClean);
        
        const adminDefaultProfile: UserProfile = {
          name: "Kwabena Prempeh",
          age: 25,
          gender: 'male',
          bio: "Passionate about travel blogger spots, live acoustic sessions, and coding up creative products. Let's find the best coffee in the city! ☕️",
          location: "Downtown District",
          occupation: "Software Engineer",
          interests: ["Coffee", "Code", "Music", "Wine", "Travel"],
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
          isVerified: true,
          premiumStatus: 'free',
          lookingFor: 'female',
          ageRangeMin: 18,
          ageRangeMax: 35,
          religion: "None / Agnostic",
          education: "Bachelor's Degree",
          languages: ["English", "Spanish"],
          createdAt: "2026-07-21"
        };

        finalProfile = foundLocal?.profile || (emailClean === 'kwabenaprempeh86@gmail.com' ? adminDefaultProfile : {
          name: emailClean.split('@')[0],
          age: 24,
          gender: 'other',
          bio: 'Dating enthusiast.',
          location: 'Downtown Area',
          occupation: 'Professional',
          interests: [],
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          isVerified: false,
          premiumStatus: 'free',
          lookingFor: 'everyone',
          ageRangeMin: 18,
          ageRangeMax: 45
        });

        // Seed to Firestore in background if quota available
        if (!getFirestoreQuotaExceeded()) {
          setDoc(doc(db, "users", emailClean), { userProfile: finalProfile }, { merge: true }).catch(e => {
            handleFirestoreError(e, "AuthGateway background update");
          });
        }
      }

      setSuccessMsg('Signed in successfully! Connecting sparks...');
      playSound('match');
      setTimeout(() => {
        onLoginSuccess(finalProfile, emailClean);
      }, 700);

    } catch (err: any) {
      console.error("Login Error:", err);
      if (tryLocalLogin()) return;

      let friendlyError = err.message || "An error occurred during authentication.";
      if (err.code === 'auth/invalid-credential') {
        friendlyError = "Incorrect password or account mismatch. Please check your credentials.";
      } else if (err.code === 'auth/user-not-found') {
        friendlyError = "No account found with this email. Please click register!";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyError = "Connection timed out. Check your local internet connectivity.";
      }
      setErrorMsg(friendlyError);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailClean = regEmail.trim().toLowerCase();
    const passClean = regPassword;
    const nameClean = regName.trim();

    if (!emailClean || !passClean || !nameClean) {
      setErrorMsg('Please fill out all required credentials (Name, Email, Password).');
      return;
    }

    if (regAge < 18) {
      setErrorMsg('You must be 18 years or older to register on JustMeet.');
      return;
    }

    if (passClean.length < 6) {
      setErrorMsg('Password should be at least 6 characters for safety.');
      return;
    }

    // Construct Profile
    const newProfile: UserProfile = {
      name: nameClean,
      age: regAge,
      gender: regGender,
      bio: regBio.trim() || 'No bio written yet.',
      location: regLocation.trim() || 'Downtown Area',
      occupation: regOccupation.trim() || 'Independent',
      interests: regInterests,
      photoUrl: regPhotoUrl,
      isVerified: false,
      premiumStatus: 'free',
      lookingFor: regLookingFor,
      ageRangeMin: 18,
      ageRangeMax: 45,
      createdAt: new Date().toLocaleDateString()
    };

    const localRegisterAndProceed = () => {
      saveUserToStorage({
        email: emailClean,
        password: passClean,
        profile: newProfile
      });
      setSuccessMsg('Account registered successfully! Tuning up sparks...');
      playSound('match');
      setTimeout(() => {
        onLoginSuccess(newProfile, emailClean);
      }, 800);
    };

    try {
      setSuccessMsg('Creating new account...');
      // 1. Create User in Firebase Authentication
      try {
        await createUserWithEmailAndPassword(auth, emailClean, passClean);
      } catch (authErr: any) {
        console.warn("Firebase Auth registration failed, completing registration locally:", authErr);
        if (authErr.code === 'auth/email-already-in-use') {
          setErrorMsg("An account with this email address already exists.");
          return;
        }
        localRegisterAndProceed();
        return;
      }

      // 2. Save profile details to Firestore database
      setSuccessMsg('Saving profile details...');
      try {
        if (!getFirestoreQuotaExceeded()) {
          await setDoc(doc(db, "users", emailClean), { userProfile: newProfile });
        }
      } catch (dbErr) {
        handleFirestoreError(dbErr, "AuthGateway register");
        console.warn("Firestore save failed, saving local copy only:", dbErr);
      }

      localRegisterAndProceed();

    } catch (err: any) {
      console.error("Registration Error:", err);
      localRegisterAndProceed();
    }
  };

  return (
    <div id="auth-gateway-container" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 selection:bg-rose-500 selection:text-white">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.07)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">
        
        {/* LEFT PANEL: Splendid Marketing & Community Vibe */}
        <div className="w-full md:w-[42%] bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle sparkles overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,113,133,0.15),transparent_50%)] pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-black tracking-tight text-white">JustMeet</h1>
                <span className="text-[10px] text-rose-300 font-bold uppercase tracking-widest block">Safe Sparks Portal</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-display font-black text-white leading-tight">
                Where real connections begin.
              </h2>
              <p className="text-sm text-rose-100/80 leading-relaxed">
                Connect deeply through mutual spark swipes, secure verification checks, custom search algorithms, and interactive chat dialogues.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Authentic Dynamic Form */}
        <div className="w-full md:w-[58%] p-8 md:p-12 bg-slate-900 flex flex-col justify-center">
          
          {/* Tabs for Login / Register selection */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
            <button
              id="auth-mode-login-tab"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                playSound('message');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all uppercase ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-950/20'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-mode-register-tab"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setSuccessMsg('');
                playSound('message');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wide transition-all uppercase ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-950/20'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-2xl flex items-center gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-2xl flex items-center gap-3 text-xs">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* -------------------- SIGN IN FORM -------------------- */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. kwabenaprempeh86@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Password</label>
                  <span className="text-[11px] text-slate-500">Default: password123</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account security key"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="auth-login-submit-btn"
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-rose-950/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <span>Authenticate & Sync Spark</span>
                </button>
              </div>
            </form>
          )}

          {/* -------------------- REGISTER FORM -------------------- */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Core Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-xs text-rose-400 font-black uppercase tracking-widest border-b border-slate-800 pb-2">1. Account Credentials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-name-input"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Kwabena Prempeh"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-email-input"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. kwabena@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-password-input"
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Age (Must be 18+)</label>
                    <div className="relative">
                      <Cake className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-age-input"
                        type="number"
                        min="18"
                        max="100"
                        required
                        value={regAge}
                        onChange={(e) => setRegAge(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Section */}
              <div className="space-y-4">
                <h3 className="text-xs text-rose-400 font-black uppercase tracking-widest border-b border-slate-800 pb-2">2. Profile Personality</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">My Gender</label>
                    <select
                      id="reg-gender-select"
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Non-Binary</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Looking For</label>
                    <select
                      id="reg-looking-for-select"
                      value={regLookingFor}
                      onChange={(e) => setRegLookingFor(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="female">Females</option>
                      <option value="male">Males</option>
                      <option value="everyone">Everyone</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Location Town</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-location-input"
                        type="text"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="e.g. Uptown Area"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Occupation / Passion</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="reg-occupation-input"
                        type="text"
                        value={regOccupation}
                        onChange={(e) => setRegOccupation(e.target.value)}
                        placeholder="e.g. Architect"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold block">Short Bio (Describe your vibe)</label>
                  <textarea
                    id="reg-bio-textarea"
                    rows={2}
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder="Tell matches what you like to do on weekends..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>
              </div>

              {/* Photo selection section */}
              <div className="space-y-4">
                <h3 className="text-xs text-rose-400 font-black uppercase tracking-widest border-b border-slate-800 pb-2">3. Profile Picture</h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  {/* Circular/Square avatar preview box */}
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-800 flex-shrink-0 bg-slate-950/50">
                    {regPhotoUrl ? (
                      <img
                        src={regPhotoUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                    {regPhotoUrl && (
                      <button
                        id="reg-delete-photo-btn"
                        type="button"
                        onClick={() => setRegPhotoUrl('')}
                        title="Remove Image"
                        className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Interactive dropzone & manual choose */}
                  <div
                    id="reg-photo-dropzone"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-950/40 hover:border-rose-500/50 transition-all text-center h-24 w-full"
                  >
                    <>
                      <Upload className="w-5 h-5 text-rose-500" />
                      <span className="text-xs font-semibold text-slate-300">Choose profile picture</span>
                      <span className="text-[10px] text-slate-500">Drag & drop or click to browse files</span>
                    </>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>

              {/* Interests checklist */}
              <div className="space-y-4">
                <h3 className="text-xs text-rose-400 font-black uppercase tracking-widest border-b border-slate-800 pb-2">4. Interests & Hobbies</h3>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {AVAILABLE_INTERESTS.map((interest) => {
                    const isSelected = regInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                          isSelected 
                            ? 'bg-rose-500 text-white border-transparent' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 pb-2">
                <button
                  id="auth-register-submit-btn"
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-rose-950/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register & Launch Companion Matchmaking</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
