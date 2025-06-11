"use client"

import { useState, useEffect } from "react"
import { BookingListCard } from "@/components/bookings/booking-list-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockReservations, mockRestaurants } from "@/lib/mock-data"
import type { Reservation } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const bookingsWithRestaurants = mockReservations.map((booking) => ({
        ...booking,
        restaurant: mockRestaurants.find((r) => r.id === booking.restaurantId),
      }))
      setBookings(bookingsWithRestaurants)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleEdit = (booking: Reservation) => {
    toast({
      title: "Edit Reservation",
      description: "This feature will be available soon.",
      duration: 3000,
    })
  }

  const handleCancel = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
    )

    toast({
      title: "Reservation Cancelled",
      description: "Your reservation has been cancelled successfully.",
      duration: 3000,
    })
  }

  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.slot) >= new Date() && booking.status !== "cancelled",
  )

  const pastBookings = bookings.filter(
    (booking) => new Date(booking.slot) < new Date() || booking.status === "cancelled",
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-xl w-1/4"></div>
          <div className="h-4 bg-muted rounded-xl w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-2">My Reservations</h1>
        <p className="text-muted-foreground">Manage your restaurant bookings and view your dining history</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-l-xl">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-r-xl">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <BookingListCard bookings={upcomingBookings} onEdit={handleEdit} onCancel={handleCancel} />
        </TabsContent>

        <TabsContent value="past">
          <BookingListCard bookings={pastBookings} onEdit={handleEdit} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
