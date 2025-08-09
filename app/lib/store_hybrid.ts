import { create } from "zustand";
import { 
  auth
} from "./firebase";
// Import Supabase for storage operations
import { supabase, type ResumeData, type Profile } from "./supabase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  TwitterAuthProvider,
  onAuthStateChanged,
  type User,
  type AuthError
} from 'firebase/auth';
import { aiService, type AIResponse } from "./ai";

import { getURL } from './getURL';

interface AppStore {
  // State
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  analysis: AIResponse | null;

  // Auth Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;

  // File Management
  uploadFile: (file: File, bucket: string, path?: string) => Promise<string | null>;
  getFileUrl: (bucket: string, path: string) => Promise<string | null>;
  deleteFile: (bucket: string, path: string) => Promise<boolean>;
  listFiles: (bucket: string, prefix?: string) => Promise<string[]>;
  downloadFile: (bucket: string, path: string) => Promise<string | null>;

  // Resume Management
  saveResume: (resumeData: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  saveResumeData: (resumeData: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  loadResumes: () => Promise<ResumeData[]>;
  getUserResumes: () => Promise<ResumeData[]>;
  getResume: (id: string) => Promise<ResumeData | null>;
  getResumeData: (id: string) => Promise<ResumeData | null>;
  deleteResume: (id: string) => Promise<void>;
  deleteResumeData: (id: string) => Promise<void>;

  // AI Analysis
  analyzeResume: (file: File, companyName: string, jobTitle: string, jobDescription: string) => Promise<AIResponse>;
  extractTextFromImage: (file: File) => Promise<string>;

  // Utility
  clearError: () => void;
  clearAnalysis: () => void;
  init: () => void;
}

export const useAppStore = create<AppStore>((set, get) => {
  const setError = (error: string) => {
    set({ error, isLoading: false });
  };

  const setLoading = (isLoading: boolean) => {
    set({ isLoading });
  };

  // Auth Methods
  const signIn = async (): Promise<void> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('🐛 DEBUG - Google Auth successful:', result.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OAuth sign in failed');
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  const checkAuthStatus = async (): Promise<void> => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Get user profile from Supabase (not Firestore)
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.uid)
            .single();

          const profile = error ? null : profileData as Profile;

          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (supabaseError) {
          // If Supabase is offline, still authenticate user with basic profile
          console.warn('Supabase offline, using fallback profile:', supabaseError);
          const fallbackProfile: Profile = {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set({
            user,
            profile: fallbackProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Auth check failed');
    }
  };

  // File Storage Methods (Supabase)
  const uploadFile = async (file: File, bucket: string, path?: string): Promise<string | null> => {
    const { user } = get();
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      // Include user ID in the path for security
      const fileName = path || `${Date.now()}-${file.name}`;
      const fullPath = `${user.uid}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      return data.path;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      return null;
    }
  };

  const getFileUrl = async (bucket: string, path: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get file URL');
      return null;
    }
  };

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed');
      return false;
    }
  };

  const listFiles = async (bucket: string, prefix?: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(prefix, {
          limit: 100,
          offset: 0
        });
      
      if (error) throw error;
      return data?.map(file => file.name) || [];
    } catch (error) {
      setError(error instanceof Error ? error.message : 'List files failed');
      return [];
    }
  };

  // Resume Management Methods (Supabase)
  const saveResume = async (resumeData: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const { user } = get();
    if (!user) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert([
          {
            ...resumeData,
            user_id: user.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      console.log('Resume saved with ID:', data.id);
      set({ isLoading: false });
      return data.id;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save resume');
      throw error;
    }
  };

  const loadResumes = async (): Promise<ResumeData[]> => {
    const { user } = get();
    if (!user) {
      setError('User not authenticated');
      return [];
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const resumes = data || [];
      set({ resumes, isLoading: false });
      return resumes;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load resumes');
      set({ isLoading: false });
      return [];
    }
  };

  const getResume = async (id: string): Promise<ResumeData | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        set({ currentResume: data, isLoading: false });
        return data;
      } else {
        setError('Resume not found');
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get resume');
      return null;
    }
  };

  const deleteResume = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      const { resumes } = get();
      const updatedResumes = resumes.filter(r => r.id !== id);
      set({ resumes: updatedResumes, isLoading: false });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete resume');
    }
  };

  // AI Analysis
  const analyzeResume = async (file: File, companyName: string, jobTitle: string, jobDescription: string): Promise<AIResponse> => {
    setLoading(true);
    try {
      // Convert file to text first (this would need to be implemented)
      const fileText = await file.text(); // This is a simplified approach
      const analysis = await aiService.analyzeResume(fileText, jobDescription, jobTitle);
      set({ analysis, isLoading: false });
      return analysis;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
      throw error;
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    // Placeholder implementation - you'd need OCR or PDF parsing
    return await file.text();
  };

  // Alias methods for backwards compatibility
  const downloadFile = getFileUrl;
  const saveResumeData = saveResume;
  const getUserResumes = loadResumes;
  const getResumeData = getResume;
  const deleteResumeData = deleteResume;

  // Initialize auth listener
  const initAuth = () => {
    console.log('🔄 Initializing Firebase auth listener...');
    
    onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user ? user.email : 'signed out');
      
      if (user) {
        console.log('👤 User found, getting/creating profile...');
        
        try {
          // Get or create user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.uid)
            .single();

          let profile: Profile;
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Error other than "not found"
            throw profileError;
          }
          
          if (!profileData) {
            console.log('📝 Creating new profile for user...');
            // Create new profile
            profile = {
              id: user.uid,
              username: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([profile]);
              
              if (insertError) throw insertError;
              console.log('✅ Profile created:', profile);
            } catch (profileError) {
              console.warn('⚠️ Could not create profile (offline), using temporary profile:', profileError);
              // Continue with temporary profile for offline usage
            }
          } else {
            profile = profileData;
            console.log('✅ Profile loaded:', profile);
          }

          console.log('🔄 Setting user state...');
          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null // Clear any previous errors
          });
          console.log('✅ User logged in successfully!');
          
        } catch (error) {
          console.error('❌ Error accessing Supabase:', error);
          
          // If Supabase is offline, still log the user in with a basic profile
          const fallbackProfile: Profile = {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('⚠️ Using fallback profile due to Supabase offline:', fallbackProfile);
          set({
            user,
            profile: fallbackProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          console.log('✅ User logged in with fallback profile!');
        }
      } else {
        console.log('👤 No user found, setting signed out state...');
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    // Initial auth check - but don't fail if Supabase is offline
    console.log('🔍 Performing initial auth check...');
    try {
      checkAuthStatus();
    } catch (error) {
      console.warn('⚠️ Initial auth check failed, but continuing...', error);
    }
  };

  // Email/Password Authentication Methods
  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user && !userCredential.user.emailVerified) {
        // Send email verification
        await sendEmailVerification(userCredential.user);
        set({ 
          error: 'Please check your email and click the confirmation link to complete signup.',
          isLoading: false 
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        // Get user profile from Supabase
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userCredential.user.uid)
            .single();

          const profile = error ? null : profileData;

          set({
            user: userCredential.user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Fallback profile if Supabase is offline
          const fallbackProfile: Profile = {
            id: userCredential.user.uid,
            username: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
            email: userCredential.user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set({
            user: userCredential.user,
            profile: fallbackProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);

      set({
        error: 'Password reset email sent. Please check your inbox.',
        isLoading: false
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password reset failed');
    }
  };

  const resendConfirmation = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      // Firebase automatically resends verification when signing up again
      // or we can use the current user to resend
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        set({
          error: 'Confirmation email sent. Please check your inbox.',
          isLoading: false
        });
      } else {
        setError('No user found or user already verified');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Resend confirmation failed');
    }
  };

  return {
    // State
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    resumes: [],
    currentResume: null,
    analysis: null,

    // Auth Actions
    signIn,
    signOut,
    checkAuthStatus,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    resendConfirmation,

    // File Management
    uploadFile,
    getFileUrl,
    deleteFile,
    listFiles,
    downloadFile,

    // Resume Management
    saveResume,
    saveResumeData,
    loadResumes,
    getUserResumes,
    getResume,
    getResumeData,
    deleteResume,
    deleteResumeData,

    // AI Analysis
    analyzeResume,
    extractTextFromImage,

    // Utility
    clearError: () => set({ error: null }),
    clearAnalysis: () => set({ analysis: null }),
    init: initAuth
  };
});

// Initialize auth on store creation (client-side only)
if (typeof window !== 'undefined') {
  const store = useAppStore.getState();
  store.init(); // This will call initAuth which sets up the auth listener
}
