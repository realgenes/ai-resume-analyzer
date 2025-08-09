// Supabase client configuration for storage only in hybrid setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for storage operations only
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Disable auth since we're using Firebase for authentication
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Storage-related types
export interface ResumeData {
  id: string;
  user_id: string;
  resume_path: string;
  image_path?: string;
  company_name: string;
  job_title: string;
  job_description: string;
  feedback?: any;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}
