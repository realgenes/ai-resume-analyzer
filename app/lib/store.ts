import { create } from "zustand";
import { supabase, type ResumeData, type Profile } from "./supabase";
import { aiService, type AIResponse } from "./ai";
import type { User, AuthError } from '@supabase/supabase-js'

import { getURL } from './getURL';

interface AppStore {
  // Auth State
  isLoading: boolean;
  error: string | null;
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;

  // Auth Methods
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  getUser: () => User | null;
  
  // Email/Password Auth Methods
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;

  // File Storage Methods
  uploadFile: (file: File, bucket: string, path?: string) => Promise<string | null>;
  downloadFile: (bucket: string, path: string) => Promise<Blob | null>;
  deleteFile: (bucket: string, path: string) => Promise<void>;
  listFiles: (bucket: string, path?: string) => Promise<any[]>;

  // Database Methods
  saveResumeData: (data: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  getResumeData: (id: string) => Promise<ResumeData | null>;
  getUserResumes: () => Promise<ResumeData[]>;
  deleteResumeData: (id: string) => Promise<void>;

  // AI Methods
  analyzeResume: (resumeText: string, jobDescription: string, jobTitle: string) => Promise<AIResponse>;
  extractTextFromImage: (imageFile: File) => Promise<string>;

  // Utility Methods
  init: () => void;
  clearError: () => void;
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
      const url = `${getURL()}auth/callback`;
      console.log('🐛 DEBUG - Auth redirect URL:', url);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: url
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        set({
          user,
          profile,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
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

  // File Storage Methods
  const uploadFile = async (file: File, bucket: string, path?: string): Promise<string | null> => {
    const { user } = get();
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      // Include user ID in the path for RLS policies
      const fileName = path || `${Date.now()}-${file.name}`;
      const fullPath = `${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file);

      if (error) throw error;
      return data.path;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      return null;
    }
  };

  const downloadFile = async (bucket: string, path: string): Promise<Blob | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Download failed');
      return null;
    }
  };

  const deleteFile = async (bucket: string, path: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const listFiles = async (bucket: string, path: string = ''): Promise<any[]> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) throw error;
      return data || [];
    } catch (error) {
      setError(error instanceof Error ? error.message : 'List files failed');
      return [];
    }
  };

  // Database Methods
  const saveResumeData = async (data: Omit<ResumeData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    const { user } = get();
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      const { data: result, error } = await supabase
        .from('resumes')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result.id;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Save failed');
      return null;
    }
  };

  const getResumeData = async (id: string): Promise<ResumeData | null> => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Get resume failed');
      return null;
    }
  };

  const getUserResumes = async (): Promise<ResumeData[]> => {
    const { user } = get();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Get resumes failed');
      return [];
    }
  };

  const deleteResumeData = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete resume failed');
    }
  };

  // AI Methods
  const analyzeResume = async (resumeText: string, jobDescription: string, jobTitle: string): Promise<AIResponse> => {
    try {
      return await aiService.analyzeResume(resumeText, jobDescription, jobTitle);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI analysis failed');
      throw error;
    }
  };

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    try {
      return await aiService.img2txt(imageFile);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Image text extraction failed');
      throw error;
    }
  };

  // Initialize
  const init = (): void => {
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkAuthStatus();
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    // Initial auth check
    checkAuthStatus();
  };

  // Email/Password Authentication Methods
  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const url = `${getURL()}auth/callback`;
      console.log('🐛 DEBUG - Signup redirect URL:', url);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: url
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation required
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: data.user,
          profile,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const url = `${getURL()}auth/reset-password`;
      console.log('🐛 DEBUG - Reset password redirect URL:', url);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: url
      });

      if (error) throw error;

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
      const url = `${getURL()}auth/callback`;
      console.log('🐛 DEBUG - Resend confirmation redirect URL:', url);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: url
        }
      });

      if (error) throw error;

      set({
        error: 'Confirmation email sent. Please check your inbox.',
        isLoading: false
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Resend confirmation failed');
    }
  };

  return {
    // State
    isLoading: true,
    error: null,
    user: null,
    profile: null,
    isAuthenticated: false,

    // Auth Methods
    signIn,
    signOut,
    checkAuthStatus,
    getUser: () => get().user,
    
    // Email/Password Auth Methods
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    resendConfirmation,

    // File Methods
    uploadFile,
    downloadFile,
    deleteFile,
    listFiles,

    // Database Methods
    saveResumeData,
    getResumeData,
    getUserResumes,
    deleteResumeData,

    // AI Methods
    analyzeResume,
    extractTextFromImage,

    // Utility
    init,
    clearError: () => set({ error: null }),
  };
});

// Backward compatibility - expose the same interface as Puter store
export const usePuterStore = useAppStore;
