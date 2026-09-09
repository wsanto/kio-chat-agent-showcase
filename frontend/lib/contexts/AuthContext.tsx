"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser, Session } from "@supabase/supabase-js"
import type { User } from "@/lib/types/api"

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<boolean>
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const isAuthenticated = !!supabaseUser

  // Sync Supabase user to ANIMA microservice
  const syncUserToAnima = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Try to get existing user from ANIMA
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabase_id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          provider: supabaseUser.app_metadata?.provider || "email"
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }
      return null
    } catch (err) {
      console.error("Error syncing user to ANIMA:", err)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSession(session)
          setSupabaseUser(session.user)

          // Sync with ANIMA
          const animaUser = await syncUserToAnima(session.user)
          if (animaUser) {
            setUser(animaUser)
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      setSession(session)
      setSupabaseUser(session?.user ?? null)

      if (session?.user) {
        const animaUser = await syncUserToAnima(session.user)
        if (animaUser) {
          setUser(animaUser)
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, syncUserToAnima])

  const signInWithGoogle = useCallback(async () => {
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
    }
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return false
      }

      if (data.user) {
        const animaUser = await syncUserToAnima(data.user)
        if (animaUser) {
          setUser(animaUser)
        }
        return true
      }

      return false
    } catch (err: any) {
      setError(err.message || "Login failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, syncUserToAnima])

  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        setError(error.message)
        return false
      }

      if (data.user) {
        const animaUser = await syncUserToAnima(data.user)
        if (animaUser) {
          setUser(animaUser)
        }
        return true
      }

      return false
    } catch (err: any) {
      setError(err.message || "Registration failed")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [supabase, syncUserToAnima])

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      setSession(null)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    if (!supabaseUser) return

    try {
      const animaUser = await syncUserToAnima(supabaseUser)
      if (animaUser) {
        setUser(animaUser)
      }
    } catch (err) {
      console.error("Error refreshing user:", err)
    }
  }, [supabaseUser, syncUserToAnima])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading,
        isAuthenticated,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper to get session for API calls
export function getAuthToken(): string | null {
  // With Supabase, tokens are managed automatically via cookies
  // This is kept for backward compatibility
  return null
}
