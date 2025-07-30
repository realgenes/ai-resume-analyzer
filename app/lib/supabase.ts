import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseKey })
  // For development, we'll create a dummy client to prevent crashes
  // You'll need to set up your Supabase project and update .env.local
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface ResumeData {
  id: string
  user_id: string
  resume_path: string
  image_path: string
  company_name: string
  job_title: string
  job_description: string
  feedback: any
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string
  email: string
  created_at: string
  updated_at: string
}
