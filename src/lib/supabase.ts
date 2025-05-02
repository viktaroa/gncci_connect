import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables at build time
if (import.meta.env.PROD && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing required Supabase environment variables')
}

// Add error handling for network issues
const handleError = (error: any) => {
  if (error.message === 'Failed to fetch') {
    throw new Error('Network error - please check your connection')
  }
  throw error
}

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'gncci_auth',
    storage: window.localStorage
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

// Types for database
export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: 'admin' | 'member' | 'non-member'
  created_at: string
  updated_at: string
  raw_user_meta_data?: {
    role?: string
    first_name?: string
    last_name?: string
  }
}

export type Company = {
  id: string
  name: string
  logo_url?: string
  registration_number: string
  industry_sector: string
  address: string
  city: string
  country: string
  website?: string
  description?: string
  employee_count?: number
  year_established?: number
  user_id: string
  created_at: string
  updated_at: string
}

export type Membership = {
  id: string
  company_id: string
  membership_type: 'sme' | 'corporate' | 'international'
  status: 'active' | 'pending' | 'expired'
  start_date: string
  end_date: string
  payment_status: 'paid' | 'unpaid' | 'partial'
  annual_fee: number
  last_payment_date: string | null
  next_payment_date: string | null
  payment_history: PaymentRecord[]
  created_at: string
  updated_at: string
}

export type PaymentRecord = {
  id: string
  membership_id: string
  amount: number
  payment_date: string
  payment_method: 'bank_transfer' | 'card' | 'cash' | 'mobile_money'
  reference: string
  status: 'success' | 'pending' | 'failed'
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  event_type: 'webinar' | 'conference' | 'workshop' | 'networking'
  registration_link?: string
  image_url?: string
  capacity?: number
  created_at: string
  updated_at: string
}

export type EventRegistration = {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'attended' | 'cancelled'
  created_at: string
  updated_at: string
}

export type BusinessOpportunity = {
  id: string
  title: string
  description: string
  opportunity_type: 'tender' | 'partnership' | 'investment' | 'job'
  sector: string
  deadline: string
  budget_range?: string
  requirements?: string
  contact_email: string
  contact_phone?: string
  company_id?: string
  created_at: string
  updated_at: string
}

export type OpportunityApplication = {
  id: string
  opportunity_id: string
  user_id: string
  company_id: string
  cover_letter: string
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  pendingApplications: number;
  upcomingEvents: number;
  memberGrowth: string;
  revenueGrowth: string;
  collectionRate: number;
  monthlyRevenue: number;
  totalRegistrations: number;
  averageAttendance: number;
}