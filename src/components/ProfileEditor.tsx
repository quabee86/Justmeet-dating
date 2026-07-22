import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, VerificationRequest } from '../types';
import { AVAILABLE_INTERESTS } from '../mockData';
import { Camera, BadgeCheck, Upload, Trash2, Video, ShieldAlert, Sparkles, RefreshCw, X, AlertCircle } from 'lucide-react';
import { auth, storage, db, handleFirestoreError, getFirestoreQuotaExceeded } from '../lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

interface ProfileEditorProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export default function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [gcsStatus, setGcsStatus] = useState<{ active: boolean; bucketName: string | null; provider: string } | null>({
    active: true,
    bucketName: "Firebase Default Bucket",
    provider: "Firebase Storage"
  });

  // Manual verification request states
  const [verificationReq, setVerificationReq] = useState<VerificationRequest | null>(null);
  const [loadingReq, setLoadingReq] = useState(false);
  const [verificationTab, setVerificationTab] = useState<'camera' | 'upload'>('camera');
  const [verificationFilePreview, setVerificationFilePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const verificationFileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch current user's verification request status from Firestore
  const fetchVerificationRequest = async () => {
    const email = auth.currentUser?.email;
    if (!email || getFirestoreQuotaExceeded()) return;
    try {
      setLoadingReq(true);
      const docRef = doc(db, "verificationRequests", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVerificationReq(docSnap.data() as VerificationRequest);
      } else {
        setVerificationReq(null);
      }
    } catch (err) {
      handleFirestoreError(err, "fetchVerificationRequest");
    } finally {
      setLoadingReq(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequest();
  }, [profile.isVerified]);

  // Form field change handlers
  const handleTextChange = (field: keyof UserProfile, val: any) => {
    onUpdate({ ...profile, [field]: val });
  };

  const toggleInterest = (interest: string) => {
    const nextInterests = profile.interests.includes(interest)
      ? profile.interests.filter((i) => i !== interest)
      : [...profile.interests, interest];
    onUpdate({ ...profile, interests: nextInterests });
  };

  // Image upload handler with Firebase Storage integration
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    setUploadError(null);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      
      try {
        const email = auth.currentUser?.email || "default_user";
        const storagePath = `users/${email}/profile/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadString(storageRef, dataUrl, 'data_url');
        const url = await getDownloadURL(storageRef);

        onUpdate({ ...profile, photoUrl: url });
      } catch (err: any) {
        console.error("Firebase Storage Upload failed:", err);
        setUploadError(err.message || "Firebase upload failed.");
      } finally {
        setIsUploading(false);
      }
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
    if (isUploading) return;
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  // Verification File Upload Handler
  const handleVerificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setVerificationFilePreview(event.target?.result as string);
        // Start simulated AI facial landmarks check on upload completion
        triggerAiScan(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Identity Verification Webcam Capture Flow
  const startVerification = async () => {
    setIsVerifying(true);
    setSelfieCaptured(null);
    setVerificationFilePreview(null);
    setScanProgress(0);
    setScanStatus('Initializing high-security camera feed...');

    if (verificationTab === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, 
          audio: false 
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Webcam access error:', err);
        setScanStatus('Failed to access camera. Please ensure permissions are granted.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror horizontal translation for intuitive selfie look
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelfieCaptured(dataUrl);
      stopCamera();
      triggerAiScan(dataUrl);
    }
  };

  const triggerAiScan = (photoData: string) => {
    setScanProgress(5);
    setScanStatus('Analyzing facial landmarks and verification criteria...');

    let progress = 5;
    const interval = setInterval(async () => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setScanStatus('Encoding selfie payload & registering with admin verification queue...');

        try {
          const email = auth.currentUser?.email || "default_user";
          
          // Upload the selfie photo to storage (or use local/fallback data URL if needed)
          let finalPhotoUrl = photoData;
          try {
            const storagePath = `users/${email}/verification/${Date.now()}-selfie.jpg`;
            const storageRef = ref(storage, storagePath);
            await uploadString(storageRef, photoData, 'data_url');
            finalPhotoUrl = await getDownloadURL(storageRef);
          } catch (storageErr) {
            console.warn("Storage upload failed, using inline data URL as fallback:", storageErr);
          }

          // Build VerificationRequest object matching types.ts
          const requestDoc: VerificationRequest = {
            id: `req-${Date.now()}`,
            profileId: email,
            profileName: profile.name,
            profilePhoto: profile.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
            selfiePhoto: finalPhotoUrl,
            status: 'pending',
            submittedAt: new Date().toLocaleString()
          };

          // Save request document to Firestore if quota permits
          if (!getFirestoreQuotaExceeded()) {
            try {
              await setDoc(doc(db, "verificationRequests", email), requestDoc);
            } catch (fsErr) {
              handleFirestoreError(fsErr, "verification request submit");
            }
          }

          // Update local state
          setVerificationReq(requestDoc);

          // Update the global state inside localStorage's justmeet_dating_state so it is fully in sync
          const localStateStr = localStorage.getItem('justmeet_dating_state');
          if (localStateStr) {
            try {
              const parsed = JSON.parse(localStateStr);
              const list = parsed.verificationRequests || [];
              const filteredList = list.filter((r: any) => r.profileId !== email);
              filteredList.push(requestDoc);
              parsed.verificationRequests = filteredList;
              localStorage.setItem('justmeet_dating_state', JSON.stringify(parsed));
            } catch (e) {
              console.error("Local storage state sync error:", e);
            }
          }

          setScanStatus('Verification Request Submitted Successfully!');
          setTimeout(() => {
            setIsVerifying(false);
            setSelfieCaptured(null);
            setVerificationFilePreview(null);
          }, 1500);

        } catch (err: any) {
          console.error("Failed to submit verification request:", err);
          setScanStatus(`Submission failed: ${err.message}`);
        }
      } else {
        setScanProgress(progress);
        if (progress > 80) {
          setScanStatus('Verifying face contours and image resolution...');
        } else if (progress > 50) {
          setScanStatus('Checking for liveness signals & depth consistency...');
        } else if (progress > 25) {
          setScanStatus('Mapping landmarks against identity database...');
        }
      }
    }, 350);
  };

  const handleCancelOrResetVerification = async () => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      setLoadingReq(true);
      if (!getFirestoreQuotaExceeded()) {
        try {
          const docRef = doc(db, "verificationRequests", email);
          await deleteDoc(docRef);
        } catch (fsErr) {
          handleFirestoreError(fsErr, "reset verification request");
        }
      }
      setVerificationReq(null);

      // Reset the local profile status
      if (profile.isVerified) {
        onUpdate({ ...profile, isVerified: false });
      }

      // Also clean from local storage
      const localStateStr = localStorage.getItem('justmeet_dating_state');
      if (localStateStr) {
        try {
          const parsed = JSON.parse(localStateStr);
          if (parsed.verificationRequests) {
            parsed.verificationRequests = parsed.verificationRequests.filter((r: any) => r.profileId !== email);
          }
          if (parsed.userProfile && parsed.userProfile.isVerified) {
            parsed.userProfile.isVerified = false;
          }
          localStorage.setItem('justmeet_dating_state', JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error("Error resetting verification request:", err);
    } finally {
      setLoadingReq(false);
    }
  };

  const cancelVerification = () => {
    stopCamera();
    setIsVerifying(false);
    setVerificationFilePreview(null);
    setSelfieCaptured(null);
  };

  return (
    <div id="profile-editor-container" className="p-4 space-y-6 text-left">
      
      {/* Onboarding Banner & Verification Status */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-extrabold text-gray-950 text-base">Your Profiler status</h3>
            {profile.isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-500 bg-sky-50 py-0.5 px-2.5 rounded-full border border-sky-150">
                <BadgeCheck className="w-4 h-4 fill-sky-500 text-white shrink-0" />
                Verified Active
              </span>
            ) : verificationReq?.status === 'pending' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 py-0.5 px-2.5 rounded-full border border-amber-100 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-500 shrink-0" />
                Pending Approval
              </span>
            ) : verificationReq?.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 py-0.5 px-2.5 rounded-full border border-rose-100">
                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                Selfie Rejected
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 py-0.5 px-2 rounded-full border border-rose-100">
                Unverified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            {profile.isVerified 
              ? "You possess the blue verified checkmark. Matches find you 3x more trustworthy!"
              : verificationReq?.status === 'pending'
              ? "Your selfie photo has been submitted and is currently in the queue for manual administrator review. Verification status will update automatically upon approval."
              : verificationReq?.status === 'rejected'
              ? "The administrator rejected your submission because your face wasn't fully visible or clear. Please submit a high-quality selfie."
              : "Verify your identity with a quick selfie upload or webcam snapshot to receive the exclusive Blue Verified Checkmark!"}
          </p>

          {/* Pending / Rejected Thumbnail Preview */}
          {verificationReq && (
            <div className="flex items-center gap-3 pt-2">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={verificationReq.selfiePhoto}
                  alt="Submitted selfie"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Submitted on:</p>
                <p className="text-xs font-semibold text-gray-700">{verificationReq.submittedAt}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {profile.isVerified ? (
            <button
              id="reset-verification-btn"
              onClick={handleCancelOrResetVerification}
              className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Status</span>
            </button>
          ) : verificationReq?.status === 'pending' ? (
            <button
              id="cancel-verification-btn"
              onClick={handleCancelOrResetVerification}
              className="bg-gray-50 hover:bg-rose-50 hover:text-rose-600 text-gray-500 font-bold text-xs py-2 px-3.5 rounded-xl border border-gray-200 hover:border-rose-150 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Submission</span>
            </button>
          ) : verificationReq?.status === 'rejected' ? (
            <button
              id="try-again-verification-btn"
              onClick={() => {
                handleCancelOrResetVerification();
                startVerification();
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-rose-500/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          ) : (
            <button
              id="verify-identity-btn"
              onClick={startVerification}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-md shadow-sky-500/10 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Verify Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Picture Upload Area */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-800">Profile Photo</label>
        <p className="text-xs text-gray-400">Drag & drop or select a high-quality portrait photo of yourself</p>

        <div className="flex items-center gap-4 pt-1">
          {/* Circular avatar box */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-100 flex-shrink-0 bg-rose-50/50">
            {isUploading ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50/80 gap-1 animate-pulse">
                <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                <span className="text-[9px] font-bold text-rose-600 uppercase">Uploading...</span>
              </div>
            ) : profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-rose-300">
                <Camera className="w-8 h-8" />
              </div>
            )}
            {profile.photoUrl && !isUploading && (
              <button
                id="delete-photo-btn"
                onClick={() => handleTextChange('photoUrl', '')}
                className="absolute bottom-1 right-1 p-1 bg-black/60 text-white hover:bg-rose-600 rounded-lg backdrop-blur-sm transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dnd dropzone area */}
          <div
            id="photo-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed border-rose-200/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-50/20 hover:border-rose-400 transition-all text-center h-24 ${
              isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
            }`}
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-5 h-5 text-rose-400 animate-spin" />
                <span className="text-xs font-semibold text-gray-700">Uploading to cloud...</span>
                <span className="text-[10px] text-gray-400 font-medium">Validating secure storage payload</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-semibold text-gray-700">Choose custom picture file</span>
                <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>



        {uploadError && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl py-2 px-3.5 text-[11px] text-rose-600 font-medium flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full flex-shrink-0 animate-ping" />
            <span>Upload Failed: {uploadError}</span>
          </div>
        )}
      </div>

      {/* Profile Detail Fields */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Profile Details</h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">First Name</label>
            <input
              id="edit-profile-name"
              type="text"
              value={profile.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
            />
          </div>

          {/* Age */}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Age</label>
            <input
              id="edit-profile-age"
              type="number"
              min="18"
              max="99"
              value={profile.age}
              onChange={(e) => handleTextChange('age', parseInt(e.target.value) || 18)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
            />
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">My Gender</label>
            <select
              id="edit-profile-gender"
              value={profile.gender}
              onChange={(e) => handleTextChange('gender', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none bg-white"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Occupation */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">My Occupation</label>
            <input
              id="edit-profile-job"
              type="text"
              value={profile.occupation}
              onChange={(e) => handleTextChange('occupation', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
              placeholder="e.g. Designer, Business Owner"
            />
          </div>

          {/* Location */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">My Location</label>
            <input
              id="edit-profile-location"
              type="text"
              value={profile.location}
              onChange={(e) => handleTextChange('location', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
              placeholder="e.g. Midtown Area"
            />
          </div>

          {/* Seeking Preference */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Seeking to Meet</label>
            <div className="grid grid-cols-3 gap-2">
              {(['female', 'male', 'everyone'] as const).map((pref) => (
                <button
                  key={pref}
                  id={`edit-pref-${pref}`}
                  type="button"
                  onClick={() => handleTextChange('lookingFor', pref)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    profile.lookingFor === pref
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-rose-200'
                  }`}
                >
                  {pref === 'everyone' ? 'Everyone' : pref === 'female' ? 'Women' : 'Men'}
                </button>
              ))}
            </div>
          </div>

          {/* Religion */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Religion / Beliefs</label>
            <select
              id="edit-profile-religion"
              value={profile.religion || ''}
              onChange={(e) => handleTextChange('religion', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none bg-white"
            >
              <option value="">Select Religion</option>
              <option value="None / Agnostic">None / Agnostic</option>
              <option value="None / Atheist">None / Atheist</option>
              <option value="Christianity">Christianity</option>
              <option value="Catholicism">Catholicism</option>
              <option value="Islam">Islam</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Buddhism">Buddhism</option>
              <option value="Judaism">Judaism</option>
              <option value="Spiritual / Other">Spiritual / Other</option>
            </select>
          </div>

          {/* Education */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Education Level</label>
            <select
              id="edit-profile-education"
              value={profile.education || ''}
              onChange={(e) => handleTextChange('education', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none bg-white"
            >
              <option value="">Select Education</option>
              <option value="High School">High School</option>
              <option value="Some College">Some College</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD / Doctorate">PhD / Doctorate</option>
              <option value="Self-taught">Self-taught</option>
            </select>
          </div>

          {/* Languages */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Languages Spoken (comma separated)</label>
            <input
              id="edit-profile-languages"
              type="text"
              value={profile.languages ? profile.languages.join(', ') : ''}
              onChange={(e) => {
                const langs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                handleTextChange('languages', langs);
              }}
              placeholder="e.g. English, Spanish, French"
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Dating Bio</label>
            <textarea
              id="edit-profile-bio"
              rows={3}
              value={profile.bio}
              onChange={(e) => handleTextChange('bio', e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-rose-300 focus:outline-none"
              placeholder="Tell other matches about yourself, what you love, and what makes you smile..."
            />
          </div>
        </div>
      </div>

      {/* Select Hobbies & Interests */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100/50 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">My Hobbies & Passions</h4>
        <p className="text-xs text-gray-400">Select standard tags that we can use to calculate your compatibility scores with matches</p>

        <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          {AVAILABLE_INTERESTS.map((interest) => {
            const isSelected = profile.interests.includes(interest);
            return (
              <button
                key={interest}
                id={`edit-interest-${interest.replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-rose-200'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* IDENTITY VERIFICATION WEBCAM MODAL */}
      {isVerifying && (
        <div id="verify-webcam-backdrop" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-sky-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-sky-100 bg-sky-50 flex items-center justify-between text-sky-800">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-sm">JustMeet Identity Verification</span>
              </div>
              <button
                id="cancel-verification-btn"
                onClick={cancelVerification}
                className="p-1 rounded-full hover:bg-sky-150 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Method Tabs (Only visible when nothing is captured/uploaded yet) */}
            {!selfieCaptured && !verificationFilePreview && (
              <div className="flex border-b border-sky-100 bg-sky-50/20">
                <button
                  type="button"
                  id="tab-camera-btn"
                  onClick={() => {
                    setVerificationTab('camera');
                    startVerification();
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                    verificationTab === 'camera'
                      ? 'border-sky-500 text-sky-600 bg-sky-50/40'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 inline mr-1" />
                  Webcam Capture
                </button>
                <button
                  type="button"
                  id="tab-upload-btn"
                  onClick={() => {
                    stopCamera();
                    setVerificationTab('upload');
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                    verificationTab === 'upload'
                      ? 'border-sky-500 text-sky-600 bg-sky-50/40'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload Photo File
                </button>
              </div>
            )}

            {/* Scanning Stage */}
            <div className="p-6 flex flex-col items-center gap-5">
              
              {verificationTab === 'camera' ? (
                /* Webcam viewbox */
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-sky-400 bg-black flex items-center justify-center shadow-inner">
                  
                  {/* Simulated circular target overlays */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-sky-300/60 animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute inset-8 rounded-full border border-sky-300/30" />
                  
                  {!selfieCaptured ? (
                    <video
                      ref={videoRef}
                      className="absolute w-full h-full object-cover scale-x-[-1]"
                      playsInline
                      muted
                    />
                  ) : (
                    <img
                      src={selfieCaptured}
                      alt="Captured Selfie"
                      className="absolute w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Simulated facial landmark dots during scanning */}
                  {selfieCaptured && scanProgress > 0 && scanProgress < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 border-2 border-dashed border-sky-400 rounded-full animate-pulse flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* File upload viewbox */
                <div className="w-full flex flex-col items-center justify-center gap-3">
                  {!verificationFilePreview ? (
                    <div
                      id="verification-dropzone"
                      onClick={() => verificationFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center min-h-[200px]"
                    >
                      <Upload className="w-8 h-8 text-sky-400" />
                      <span className="text-xs font-bold text-gray-700">Choose or Drop your Selfie File</span>
                      <span className="text-[10px] text-gray-400">Please select a clear picture showing your full face</span>
                      <input
                        ref={verificationFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleVerificationFileChange}
                      />
                    </div>
                  ) : (
                    <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-sky-400 bg-gray-50 flex items-center justify-center shadow-inner">
                      {/* Simulated circular target overlays */}
                      <div className="absolute inset-4 rounded-full border border-dashed border-sky-300/60 animate-spin" style={{ animationDuration: '20s' }} />
                      <div className="absolute inset-8 rounded-full border border-sky-300/30" />
                      
                      <img
                        src={verificationFilePreview}
                        alt="Uploaded Selfie Preview"
                        className="absolute w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      {/* Scanning landmark dots */}
                      {scanProgress > 0 && scanProgress < 100 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 border-2 border-dashed border-sky-400 rounded-full animate-pulse flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Progress and status message */}
              <div className="w-full space-y-2 text-center">
                <p className="text-xs font-bold text-gray-800 min-h-8 px-2">
                  {scanStatus}
                </p>

                {scanProgress > 0 && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 rounded-full transition-all duration-300" 
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-sky-600 block">
                      Scanning: {scanProgress}% Complete
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Control action buttons */}
            <div className="p-4 bg-sky-50/50 border-t border-sky-100 flex justify-end gap-3">
              <button
                id="webcam-cancel-btn"
                onClick={cancelVerification}
                className="py-2 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              
              {verificationTab === 'camera' ? (
                !selfieCaptured ? (
                  <button
                    id="webcam-capture-btn"
                    onClick={captureSelfie}
                    className="py-2 px-5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Selfie Snapshot</span>
                  </button>
                ) : (
                  <button
                    id="webcam-retry-btn"
                    onClick={startVerification}
                    disabled={scanProgress >= 100}
                    className="py-2 px-5 rounded-xl border border-sky-300 text-sky-600 text-xs font-semibold hover:bg-sky-50 transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Capture</span>
                  </button>
                )
              ) : (
                verificationFilePreview && (
                  <button
                    id="upload-retry-btn"
                    onClick={() => {
                      setVerificationFilePreview(null);
                      setScanProgress(0);
                      setScanStatus('Please select a selfie file.');
                    }}
                    disabled={scanProgress >= 100}
                    className="py-2 px-5 rounded-xl border border-sky-300 text-sky-600 text-xs font-semibold hover:bg-sky-50 transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Select Different File</span>
                  </button>
                )
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
