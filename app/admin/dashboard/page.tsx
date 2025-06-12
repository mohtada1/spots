"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, CheckCircle, X, LogOut } from "lucide-react"
import type { Reservation } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/lib/admin-auth-context"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { RestaurantManager } from "@/components/admin/restaurant-manager"
import type { Restaurant } from "@/lib/types"

function AdminDashboardContent() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { session, signOut } = useAdminAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      if (!session?.access_token) {
        throw new Error("No access token")
      }

      const response = await fetch("/api/admin/reservations", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setReservations(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reservations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (reservationId: string, status: "confirmed" | "cancelled") => {
    try {
      if (!session?.access_token) {
        throw new Error("No access token")
      }

      const response = await fetch(`/api/admin/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (result.success) {
        setReservations((prev) => prev.map((res) => (res.id === reservationId ? result.data : res)))

        toast({
          title: status === "confirmed" ? "Reservation Confirmed" : "Reservation Cancelled",
          description: "The customer will be notified.",
          variant: status === "confirmed" ? "success" : "default",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Error",
        description: "Failed to update reservation",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const pendingReservations = reservations.filter((r) => r.status === "pending")
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed")
  const totalReservations = reservations.length

  const handleRestaurantUpdated = (restaurant: Restaurant) => {
    setRestaurants((prev) => prev.map((r) => (r.id === restaurant.id ? restaurant : r)))
  }

  const handleRestaurantDeleted = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id))
  }

  const handleRestaurantCreated = (restaurant: Restaurant) => {
    setRestaurants((prev) => [...prev, restaurant])
  }

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-2">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Manage your reservations and track your restaurant's performance</p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="rounded-xl">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
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
            <p className="text-xs text-muted-foreground">All time</p>
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
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
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
            <div className="text-2xl font-bold">
              {totalReservations > 0
                ? (reservations.reduce((sum, r) => sum + r.party_size, 0) / totalReservations).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">People per reservation</p>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Management */}
      <RestaurantManager
        restaurants={restaurants}
        onRestaurantUpdated={handleRestaurantUpdated}
        onRestaurantDeleted={handleRestaurantDeleted}
        onRestaurantCreated={handleRestaurantCreated}
      />

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
                      <h4 className="font-medium">{reservation.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reservation.party_size} people • {reservation.reservation_date} at{" "}
                        {reservation.reservation_time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.customer_phone} • ID: {reservation.confirmation_code}
                      </p>
                    </div>
                  </div>
                  {reservation.special_requests && (
                    <p className="text-sm text-muted-foreground mt-2">Note: {reservation.special_requests}</p>
                  )}
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
                        onClick={() => handleStatusUpdate(reservation.id, "confirmed")}
                        className="booking-highlight rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(reservation.id, "cancelled")}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {reservations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No reservations found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <AdminDashboardContent />
    </AdminRouteGuard>
  )
}
