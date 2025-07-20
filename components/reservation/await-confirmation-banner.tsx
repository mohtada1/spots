"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Phone, Calendar, Users, MapPin } from "lucide-react"
import type { Reservation } from "@/lib/types"

interface AwaitConfirmationBannerProps {
  reservation: Reservation
}

export function AwaitConfirmationBanner({ reservation }: AwaitConfirmationBannerProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending")
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    // Simulate confirmation after 3-8 seconds
    const confirmationTime = Math.random() * 5000 + 3000

    const timer = setTimeout(() => {
      setStatus("confirmed")
    }, confirmationTime)

    // Update elapsed time every second
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (status === "confirmed") {
      // Auto-redirect to home page after confirmation
      setTimeout(() => {
        router.push("/")
      }, 5000)
    }
  }, [status, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        {status === "pending" ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins text-[#262626]">Confirming Your Reservation</h1>
            <p className="text-gray-600">
              We're contacting the restaurant now. You'll receive an SMS confirmation shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#14B45C] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins text-[#14B45C]">Reservation Confirmed!</h1>
            <p className="text-gray-600">
              Great news! Your table has been reserved. Check your phone for SMS confirmation.
            </p>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reservation Details</CardTitle>
            <Badge
              variant={status === "confirmed" ? "default" : "secondary"}
              className={status === "confirmed" ? "bg-[#14B45C]" : "bg-[#FF6B35]"}
            >
              {status === "confirmed" ? "Confirmed" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{reservation.restaurant?.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{reservation.restaurant?.address || `${reservation.restaurant?.city}, Pakistan`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{reservation.restaurant?.phone || "+92-XXX-XXXXXXX"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date & Time</span>
                </span>
                <span className="font-medium">
                  {formatDate(reservation.reservation_date)} at {reservation.reservation_time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Party Size</span>
                </span>
                <span className="font-medium">
                  {reservation.party_size} {reservation.party_size === 1 ? "person" : "people"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Reservation ID</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{reservation.id}</span>
            </div>
          </div>

          {reservation.special_requests && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Special Requests:</span> {reservation.special_requests}
            </p>
          )}
        </CardContent>
      </Card>

      {status === "confirmed" ? (
        <div className="space-y-4">
          <div className="bg-[#14B45C] bg-opacity-10 border border-[#14B45C] border-opacity-20 rounded-lg p-4">
            <p className="text-[#14B45C] text-sm font-medium mb-2">
              ✓ SMS confirmation sent to {reservation.customer_phone}
            </p>
            <p className="text-xs text-gray-600">Please arrive 10 minutes before your reservation time.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push(`/pending/${reservation.confirmation_code}`)} 
              className="btn-primary flex-1"
            >
              Check Status
            </Button>
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
              Book Another Table
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Waiting for confirmation... ({timeElapsed}s)</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      )}
    </div>
  )
}
