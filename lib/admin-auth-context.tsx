"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"
import type { User, Session } from "@supabase/supabase-js"

interface AdminAuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      await checkAdminStatus(session?.user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (user: User | null) => {
    if (!user?.email) {
      setIsAdmin(false)
      return
    }

    try {
      const { data, error } = await supabase.from("admin_users").select("*").eq("email", user.email).single()

      setIsAdmin(!error && !!data)
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.user)
        setSession(result.session)
        setIsAdmin(true)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
