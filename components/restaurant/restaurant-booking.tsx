"use client"

import { useState } from "react"
import { AvailabilityPicker } from "@/components/restaurant/availability-picker"
import { BookingDialog } from "@/components/reservation/booking-dialog"
import type { Restaurant } from "@/lib/types"

interface RestaurantBookingProps {
  restaurant: Restaurant
}

export function RestaurantBooking({ restaurant }: RestaurantBookingProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; partySize: number } | null>(null)

  const handleSlotSelect = (slot: { date: string; time: string; partySize: number }) => {
    setSelectedSlot(slot)
    setIsBookingDialogOpen(true)
  }

  return (
    <>
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Make a Reservation</h2>
        <AvailabilityPicker
          restaurantId={restaurant.id}
          onSelect={handleSlotSelect}
        />
      </div>

      {selectedSlot && (
        <BookingDialog
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          restaurant={restaurant}
          selectedSlot={selectedSlot}
        />
      )}
    </>
  )
}
