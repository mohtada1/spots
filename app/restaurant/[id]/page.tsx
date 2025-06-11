"use client"
import { useState } from "react"
import { RestaurantHero } from "@/components/restaurant/restaurant-hero"
import { AvailabilityPicker } from "@/components/restaurant/availability-picker"
import { BookingDialog } from "@/components/reservation/booking-dialog"
import { mockRestaurants } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RestaurantPageProps {
  params: {
    id: string
  }
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = mockRestaurants.find((r) => r.id === params.id)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; partySize: number } | null>(null)

  if (!restaurant) {
    notFound()
  }

  const handleSlotSelect = (slot: { date: string; time: string; partySize: number }) => {
    setSelectedSlot(slot)
    setIsBookingDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <RestaurantHero restaurant={restaurant} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Menu Preview */}
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle>Popular Dishes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex space-x-4 p-4 border rounded-xl">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div>
                        <h4 className="font-medium">Signature Dish {item}</h4>
                        <p className="text-sm text-muted-foreground">Delicious description</p>
                        <p className="text-sm font-medium">₨ 1,200</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div>
                          <p className="font-medium text-sm">Customer {review}</p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-xs">
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great food and excellent service. Highly recommended!
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservation Widget */}
          <div className="lg:col-span-1">
            <AvailabilityPicker restaurantId={restaurant.id} onSelect={handleSlotSelect} />
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedSlot && (
        <BookingDialog
          restaurant={restaurant}
          selectedSlot={selectedSlot}
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
        />
      )}
    </div>
  )
}
