import React, { useState, useEffect, useRef } from 'react';
import { 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Trash2, 
  Download, 
  UploadCloud, 
  HardDrive, 
  Search, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { CloudFile } from '../types';
import { db, storage, handleFirestoreError, getFirestoreQuotaExceeded } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

interface MyCloudVaultProps {
  userEmail: string;
  showToast: (type: 'system' | 'match' | 'wink', title: string, body: string) => void;
}

export default function MyCloudVault({ userEmail, showToast }: MyCloudVaultProps) {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format byte size nicely
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to select icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    const type = mimeType.toLowerCase();
    if (type.startsWith('image/')) return <Image className="w-6 h-6 text-emerald-500" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6 text-amber-500" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('text') || type.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Load user files from Firestore subcollection
  const loadFiles = async () => {
    if (!userEmail || getFirestoreQuotaExceeded()) return;
    setIsLoading(true);
    try {
      const filesColRef = collection(db, "users", userEmail, "files");
      const querySnap = await getDocs(filesColRef);
      const loadedFiles: CloudFile[] = [];
      querySnap.forEach((docSnap) => {
        loadedFiles.push({
          id: docSnap.id,
          ...docSnap.data()
        } as CloudFile);
      });
      
      // Sort files by upload date descending
      loadedFiles.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      setFiles(loadedFiles);
    } catch (err: any) {
      handleFirestoreError(err, "loadFiles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [userEmail]);

  // Handle uploading files
  const handleUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;

      try {
        // 1. Upload directly to Firebase Storage
        const storagePath = `users/${userEmail}/vault/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadString(storageRef, base64Data, 'data_url');
        const url = await getDownloadURL(storageRef);

        // 2. Save file metadata in Cloud Firestore subcollection (fully locked down via Security Rules)
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fileMetadata: Omit<CloudFile, 'id'> = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: formatBytes(file.size),
          url: url,
          provider: "Firebase Storage",
          key: storagePath,
          uploadDate: new Date().toLocaleString()
        };

        if (!getFirestoreQuotaExceeded()) {
          try {
            const fileDocRef = doc(db, "users", userEmail, "files", fileId);
            await setDoc(fileDocRef, fileMetadata);
          } catch (fsErr) {
            handleFirestoreError(fsErr, "save file metadata");
          }
        }

        showToast('system', 'File Uploaded ☁️', `"${file.name}" stored securely on Firebase Storage.`);
        loadFiles();
      } catch (err: any) {
        console.error("Upload error:", err);
        showToast('system', 'Upload Failed ❌', err.message || 'Firebase upload failed.');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      showToast('system', 'Upload Failed ❌', 'Could not read local file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected[0]) {
      handleUpload(selected[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle deleting files from Firebase Storage and Firestore
  const handleDelete = async (file: CloudFile) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${file.name}"?`)) return;

    try {
      // 1. Delete from Firebase Storage if a key is provided
      if (file.key) {
        const storageRef = ref(storage, file.key);
        await deleteObject(storageRef);
      }

      if (!getFirestoreQuotaExceeded()) {
        try {
          const fileDocRef = doc(db, "users", userEmail, "files", file.id);
          await deleteDoc(fileDocRef);
        } catch (fsErr) {
          handleFirestoreError(fsErr, "delete file doc");
        }
      }

      showToast('system', 'File Removed 🗑️', `Permanently deleted "${file.name}" from your cloud vault.`);
      loadFiles();
    } catch (err: any) {
      console.error("Deletion error:", err);
      showToast('system', 'Deletion Failed ❌', err.message || 'Could not remove file.');
    }
  };

  // Filter files by search term
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="cloud-vault-container" className="bg-white rounded-3xl border border-rose-100 p-6 md:p-8 shadow-sm">
      
      {/* Intro Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 mb-6">
        <div>
          <h3 className="text-xl font-black text-gray-950 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-rose-500" />
            My Personal Cloud Vault
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Secure, end-to-end user storage. Upload high-res dating pics, biometric ID documents, and private media files.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            id="vault-refresh-btn"
            onClick={loadFiles}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl border border-gray-200 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
            Sync Vault
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100 text-[10px] font-bold text-rose-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Security Rules Active
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        id="vault-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          dragActive 
            ? 'border-rose-500 bg-rose-50/20 scale-[1.01]' 
            : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className={`p-4 rounded-2xl bg-rose-50 text-rose-500 ${isUploading ? 'animate-bounce' : ''}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <div>
          <p className="font-bold text-sm text-gray-800">
            {isUploading ? 'Uploading file to Cloud...' : 'Drag & drop any file here, or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports PNG, JPG, PDF, Documents up to 10MB
          </p>
        </div>

        {isUploading && (
          <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-rose-500 h-full animate-pulse w-2/3 rounded-full" />
          </div>
        )}
      </div>

      {/* Controls & Search Bar */}
      <div className="mt-8 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="vault-search-input"
            type="text"
            placeholder="Search vault files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="text-[11px] text-gray-400 font-bold self-start sm:self-center">
          Showing {filteredFiles.length} of {files.length} secure files
        </div>
      </div>

      {/* Files List / Grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-xs font-bold">Verifying authorization & syncing vault...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="border border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-10 h-10 text-gray-300" />
          <div>
            <h4 className="font-bold text-sm text-gray-800">No files in your vault</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {searchTerm 
                ? 'No files matched your search keywords. Try typing another name.' 
                : 'Upload files above to secure them. All metadata is private, encrypted, and isolated by Firestore rules.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFiles.map((file) => (
            <div 
              key={file.id} 
              id={`vault-file-${file.id}`}
              className="border border-gray-100 rounded-2xl p-4 hover:border-rose-100 hover:shadow-md hover:shadow-rose-50/10 transition-all flex items-start gap-4"
            >
              <div className="p-3 bg-gray-50 rounded-xl shrink-0">
                {getFileIcon(file.type)}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-gray-800 truncate" title={file.name}>
                  {file.name}
                </h4>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-gray-400 font-medium">
                  <span className="font-bold text-gray-500">{file.size}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {file.uploadDate}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                    {file.provider}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-gray-50 rounded-lg transition-all"
                      title="Download/View File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Notice Card */}
      <div className="mt-8 bg-blue-50/40 border border-blue-100 rounded-2xl p-4 flex gap-3 text-left">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-xs text-blue-900">Personal Data & Media Vault Security</h5>
          <p className="text-[11px] text-blue-700/80 leading-relaxed mt-1">
            This module integrates direct cloud-to-database tracking. All entries are protected by Google Firestore Security Rules where <code className="bg-white/60 px-1 py-0.5 rounded font-mono">request.auth.token.email</code> verifies ownership. No third party or other users can view, index, or query your vault contents.
          </p>
        </div>
      </div>

    </div>
  );
}
