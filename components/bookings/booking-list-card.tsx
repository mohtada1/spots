"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MapPin, Edit, X } from "lucide-react"
import type { Reservation } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BookingListCardProps {
  bookings: Reservation[]
  onEdit: (booking: Reservation) => void
  onCancel: (bookingId: string) => void
}

export function BookingListCard({ bookings, onEdit, onCancel }: BookingListCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return dateString.split("T")[1] || "19:00"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-foreground text-background"
      case "pending":
        return "bg-yellow-500 text-white"
      case "cancelled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isPastReservation = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No reservations yet</h3>
        <p className="text-muted-foreground mb-4">
          Ready to discover amazing restaurants? Start by making your first reservation.
        </p>
        <Link href="/search">
          <Button className="booking-highlight rounded-xl">Find Restaurants</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <Card
          key={booking.id}
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg border-0 shadow-md"
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Restaurant Info */}
              <div className="flex space-x-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.restaurant?.imageUrl || "/placeholder.svg?height=64&width=64"}
                    alt={booking.restaurant?.name || "Restaurant"}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold font-poppins truncate">{booking.restaurant?.name}</h3>
                    <Badge className={`${getStatusColor(booking.status)} rounded-full`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.slot)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(booking.slot)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {booking.partySize} {booking.partySize === 1 ? "person" : "people"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.restaurant?.city}</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">Note: {booking.notes}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                {!isPastReservation(booking.slot) && booking.status !== "cancelled" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(booking)}
                      className="flex-1 lg:flex-none rounded-xl"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel your reservation at {booking.restaurant?.name}? This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Keep Reservation</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onCancel(booking.id)}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            Cancel Reservation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {booking.restaurant && (
                  <Link href={`/restaurant/${booking.restaurant.id}`}>
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none rounded-xl">
                      View Restaurant
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Reservation ID */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Reservation ID: {booking.id}</span>
                <span>Booked for: {booking.customerName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
