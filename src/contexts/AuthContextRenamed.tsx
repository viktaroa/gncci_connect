import * as React from 'react'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase, type User } from '../lib/supabase'
import { type Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session from supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) {
        const role = session.user.user_metadata?.role || 
                     session.user.app_metadata?.role || 
                     'non-member'
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          phone: session.user.user_metadata?.phone || '',
          role,
          created_at: session.user.created_at || '',
          updated_at: session.user.updated_at || ''
        } as User)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const role = session.user.user_metadata?.role || 
                       session.user.app_metadata?.role || 
                       'non-member'
          setUser({
            id: session.user.id,
            email: session.user.email!,
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            phone: session.user.user_metadata?.phone || '',
            role,
            created_at: session.user.created_at || '',
            updated_at: session.user.updated_at || ''
          } as User)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned after successful sign in')
      }

      // Get the user's metadata including role
      const role = data.user.user_metadata?.role || 
                   data.user.app_metadata?.role || 
                   'non-member'

      // Set user with role included
      setUser({
        id: data.user.id,
        email: data.user.email!,
        first_name: data.user.user_metadata?.first_name || '',
        last_name: data.user.user_metadata?.last_name || '',
        phone: data.user.user_metadata?.phone || '',
        role,
        created_at: data.user.created_at || '',
        updated_at: data.user.updated_at || ''
      } as User)
      setSession(data.session)

      toast.success('Successfully signed in!')
    } catch (error: any) {
      console.error('Authentication error:', error)
      toast.error(error.message || 'An error occurred during sign in')
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: 'non-member', // Default role for new sign-ups
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Registration successful! Please verify your email.')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during registration')
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      toast.success('Successfully signed out!')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign out')
      throw error
    }
  }

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        throw error
      }
      
      toast.success('Password reset link sent to your email!')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      throw error
    }
  }

  // Reset password
  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) {
        throw error
      }
      
      toast.success('Password has been updated!')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}