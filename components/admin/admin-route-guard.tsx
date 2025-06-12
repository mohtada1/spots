"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth-context"

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdmin, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/admin/login")
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
