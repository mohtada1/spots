"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, CheckCircle, X } from "lucide-react"
import { mockReservations, mockRestaurants } from "@/lib/mock-data"
import type { Reservation } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const reservationsWithRestaurants = mockReservations.map((reservation) => ({
        ...reservation,
        restaurant: mockRestaurants.find((r) => r.id === reservation.restaurantId),
      }))
      setReservations(reservationsWithRestaurants)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleConfirm = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === reservationId ? { ...res, status: "confirmed" as const } : res)),
    )

    toast({
      title: "Reservation Confirmed",
      description: "The customer has been notified via SMS.",
      variant: "success",
      duration: 3000,
    })
  }

  const handleDecline = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === reservationId ? { ...res, status: "cancelled" as const } : res)),
    )

    toast({
      title: "Reservation Declined",
      description: "The customer has been notified via SMS.",
      duration: 3000,
    })
  }

  const pendingReservations = reservations.filter((r) => r.status === "pending")
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed")
  const totalReservations = reservations.length

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-xl w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-2">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">Manage your reservations and track your restaurant's performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReservations}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingReservations.length}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedReservations.length}</div>
            <p className="text-xs text-muted-foreground">Ready to serve</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Party Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">People per reservation</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Bookings Feed */}
      <Card className="rounded-xl border-0 shadow-md">
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{reservation.customerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reservation.partySize} people • {new Date(reservation.slot).toLocaleDateString()} at{" "}
                        {reservation.slot.split("T")[1]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.customerPhone} • ID: {reservation.id}
                      </p>
                    </div>
                  </div>
                  {reservation.notes && <p className="text-sm text-muted-foreground mt-2">Note: {reservation.notes}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={
                      reservation.status === "confirmed"
                        ? "bg-foreground text-background"
                        : reservation.status === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </Badge>

                  {reservation.status === "pending" && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(reservation.id)}
                        className="booking-highlight rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(reservation.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
