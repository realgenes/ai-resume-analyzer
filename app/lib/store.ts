import { create } from "zustand";
// Import Supabase for authentication and storage operations
import { supabase, type ResumeData, type Profile } from "./supabase";
import { aiService, type AIResponse } from "./ai";
import type { User, Session } from '@supabase/supabase-js';

const SECURE_UPLOADS = import.meta.env.VITE_SECURE_UPLOADS === 'true';

interface AppStore {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  analysis: AIResponse | null;

  // Auth Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;

  // File Management
  uploadFile: (file: File, bucket: string, path?: string) => Promise<string | null>;
  testConnection: () => Promise<boolean>;
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
  analyzeResume: (resumeText: string, jobDescription: string, jobTitle: string) => Promise<AIResponse>;

  // Utility
  clearError: () => void;
  clearAnalysis: () => void;
  init: () => void;
}

let isInitialized = false;

export const useAppStore = create<AppStore>((set, get) => {
  const setError = (error: string) => {
    set({ error, isLoading: false });
  };

  const setLoading = (isLoading: boolean) => {
    set({ isLoading });
  };

  // Auth Methods
  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        throw error;
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OAuth sign in failed');
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      set({
        user: null,
        profile: null,
        session: null,
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user) {
        const user = session.user;
        
        // Get user profile from Supabase
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          let profile: Profile;
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Error other than "not found"
            throw profileError;
          }
          
          if (!profileData) {
            // Create new profile
            profile = {
              id: user.id,
              username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(profile);
              
              if (insertError) {
                console.warn('⚠️ Could not create profile:', insertError);
              } else {
              }
            } catch (profileError) {
              console.warn('⚠️ Could not create profile (offline), using temporary profile:', profileError);
            }
          } else {
            profile = profileData;
          }

          set({
            user,
            profile,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (supabaseError) {
          // If Supabase profile operations fail, still authenticate user with basic profile
          console.warn('Supabase profile error, using fallback profile:', supabaseError);
          const fallbackProfile: Profile = {
            id: user.id,
            username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set({
            user,
            profile: fallbackProfile,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else {
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Auth check failed');
    }
  };

  // File Management Methods
  const testConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('🔴 Connection test failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('🔴 Connection test error:', error);
      return false;
    }
  };

  const uploadFile = async (file: File, bucket: string, path?: string, retryCount = 0): Promise<string | null> => {
    const { user } = get();
    
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    if (!file || file.size === 0) {
      console.error('🔴 Upload failed: Invalid file');
      setError('Invalid file provided');
      return null;
    }

    // Don't set global loading state for individual file uploads
    
    // Test connection before attempting upload
    if (retryCount === 0) {
      const connectionOk = await testConnection();
      if (!connectionOk) {
        setError('Unable to connect to storage service. Please check your internet connection.');
        return null;
      }
    }
    
    try {
      // Generate unique filename with more entropy to avoid conflicts
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${randomId}_${sanitizedName}`;
      const fullPath = path ? `${path}/${fileName}` : `${user.id}/${fileName}`;


      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half' // Enable streaming for better performance
        });

      // Reduced timeout to 45 seconds for better user experience
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 45 seconds. Please check your internet connection and try again.')), 45000);
      });

      const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      // Check if the result is an error from timeout
      if (result instanceof Error) {
        throw result;
      }

      const { data, error } = result;

      if (error) {
        
        // Provide more specific error messages
        if (error.message.includes('bucket')) {
          throw new Error(`Storage bucket '${bucket}' not found. Please create the bucket in Supabase Dashboard.`);
        } else if (error.message.includes('policy') || error.message.includes('row-level security')) {
          throw new Error(`Storage access denied. Please set up RLS policies for bucket '${bucket}'. Run the SQL setup script in your Supabase SQL Editor.`);
        } else if (error.message.includes('auth')) {
          throw new Error('Authentication required for file upload.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error during upload. Please check your internet connection and try again.');
        }
        
        throw error;
      }

      return data.path;
    } catch (error) {
      
      // Retry logic for network errors or timeouts
      const isRetryableError = error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch')
      );
      
      if (isRetryableError && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000)); // Progressive delay
        return uploadFile(file, bucket, path, retryCount + 1);
      }
      
      setError(error instanceof Error ? error.message : 'File upload failed');
      return null;
    }
  };

  const getFileUrl = async (bucket: string, path: string): Promise<string | null> => {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  };

  const listFiles = async (bucket: string, prefix?: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(prefix);

      if (error) {
        throw error;
      }

      return data?.map(file => file.name) || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  };

  const downloadFile = async (bucket: string, path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        throw error;
      }

      return URL.createObjectURL(data);
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  };

  // Resume Management Methods
  const saveResume = async (resumeData: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const { user } = get();
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const newResume = {
        ...resumeData,
        user_id: user.id,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('resumes')
        .insert(newResume)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      const { resumes } = get();
      set({ 
        resumes: [...resumes, data],
        isLoading: false 
      });

      return data.id;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save resume');
      throw error;
    }
  };

  const saveResumeData = saveResume; // Alias for compatibility

  const loadResumes = async (): Promise<ResumeData[]> => {
    const { user } = get();
    if (!user) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ resumes: data || [] });
      return data || [];
    } catch (error) {
      console.error('Error loading resumes:', error);
      return [];
    }
  };

  const getUserResumes = loadResumes; // Alias for compatibility

  const getResume = async (id: string): Promise<ResumeData | null> => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      set({ currentResume: data });
      return data;
    } catch (error) {
      console.error('Error getting resume:', error);
      return null;
    }
  };

  const getResumeData = getResume; // Alias for compatibility

  const deleteResume = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      const { resumes } = get();
      set({ 
        resumes: resumes.filter(r => r.id !== id),
        isLoading: false 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete resume');
    }
  };

  const deleteResumeData = deleteResume; // Alias for compatibility

  // AI Analysis Methods
  const analyzeResume = async (resumeText: string, jobDescription: string, jobTitle: string): Promise<AIResponse> => {
    setLoading(true);
    try {
      const analysis = await aiService.analyzeResume(resumeText, jobDescription, jobTitle);
      
      set({ 
        analysis,
        isLoading: false 
      });
      
      return analysis;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
      throw error;
    }
  };

  // Email/Password Authentication Methods
  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      
      // Try signup without email confirmation first
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });


      if (error) {
        console.error('🔴 Signup error:', error);
        throw error;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          set({ 
            error: 'Account created successfully! You can now sign in.',
            isLoading: false 
          });
        } else {
          set({ 
            error: 'Account created! Please check your email for confirmation link, or try signing in if confirmation is disabled.',
            isLoading: false 
          });
        }
      } else {
        set({ 
          error: 'Account may have been created. Please try signing in.',
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('🔴 Signup failed:', error);
      setError(error instanceof Error ? error.message : 'Sign up failed');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Get user profile from Supabase
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const profile = error ? null : profileData;

          set({
            user: data.user,
            session: data.session,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          // Fallback profile if Supabase is offline
          const fallbackProfile: Profile = {
            id: data.user.id,
            username: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set({
            user: data.user,
            session: data.session,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        throw error;
      }

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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      set({
        error: 'Confirmation email sent. Please check your inbox.',
        isLoading: false
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Resend confirmation failed');
    }
  };

  // Utility Methods
  const clearError = () => {
    set({ error: null });
  };

  const clearAnalysis = () => {
    set({ analysis: null });
  };

  const init = () => {
    
    // Check if already initialized to prevent duplicate listeners
    if (isInitialized) {
      return;
    }
    
    isInitialized = true;
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (session?.user) {
        
        try {
          // Get or create user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          let profile: Profile;
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Error other than "not found"
            throw profileError;
          }
          
          if (!profileData) {
            // Create new profile
            profile = {
              id: session.user.id,
              username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(profile);
              
              if (insertError) {
                console.warn('⚠️ Could not create profile:', insertError);
              } else {
              }
            } catch (profileError) {
              console.warn('⚠️ Could not create profile (offline), using temporary profile:', profileError);
            }
          } else {
            profile = profileData;
          }

          set({
            user: session.user,
            session,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
        } catch (error) {
          console.error('❌ Error accessing Supabase:', error);
          
          // If Supabase is offline, still log the user in with a basic profile
          const fallbackProfile: Profile = {
            id: session.user.id,
            username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set({
            user: session.user,
            session,
            profile: fallbackProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    // Initial auth check
    try {
      checkAuthStatus();
    } catch (error) {
      console.warn('⚠️ Initial auth check failed, but continuing...', error);
    }

    // Store the subscription for potential cleanup
    (window as any).__supabaseAuthSubscription = subscription;
  };

  return {
    // State
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    resumes: [],
    currentResume: null,
    analysis: null,

    // Auth Actions
    signInWithGoogle,
    signOut,
    checkAuthStatus,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    resendConfirmation,

    // File Management
    uploadFile,
    testConnection,
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

    // Utility
    clearError,
    clearAnalysis,
    init
  };
});
