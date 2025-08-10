"use client"
import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { AvailabilityPicker } from "@/components/restaurant/availability-picker"
import { BookingDialog } from "@/components/reservation/booking-dialog"
import { api } from "@/lib/api"
import Image from "next/image"
import { MapPin, Phone, Clock } from "lucide-react"
import type { Restaurant } from "@/lib/types"

export default function RestaurantPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; partySize: number } | null>(null)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        const restaurantData = await api.getRestaurant(id)
        if (!restaurantData) {
          notFound()
        }
        setRestaurant(restaurantData)
      } catch (error) {
        console.error('Error fetching restaurant:', error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    notFound()
  }

  const handleSlotSelect = (slot: { date: string; time: string; partySize: number }) => {
    setSelectedSlot(slot)
    setIsBookingDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Centered Restaurant Image */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="relative h-64 md:h-96 w-full max-w-2xl rounded-food-small overflow-hidden bg-gray-100">
            <Image
              src={restaurant.image_url || '/placeholder.svg?height=600&width=800'}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Restaurant Info and Reservation Layout */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Restaurant Info/Bio - Left Side */}
            <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold font-poppins text-food-text">{restaurant.name}</h1>
              </div>

              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <span className="text-red-500">★</span>
                  <span className="font-medium">{restaurant.rating}</span>
                  <span className="text-sm">(124 reviews)</span>
                </div>
                <span className="text-lg font-medium">{restaurant.price_level}</span>
              </div>

              <div className="space-y-2 text-gray-600 mb-6">
                {(restaurant.address || restaurant.city) && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{restaurant.address ? `${restaurant.address}, ${restaurant.city}` : restaurant.city}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.opening_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                )}
              </div>
            </div>

            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-food-text">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisine.map((cuisineType, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm border">
                      {cuisineType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {restaurant.description && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-food-text">About</h3>
                <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}
          </div>

            {/* Reservation Widget - Right Side */}
            <div className="lg:col-span-2">
              <AvailabilityPicker restaurantId={restaurant.id} onSelect={handleSlotSelect} />
            </div>
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
