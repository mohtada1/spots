"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, User, Phone, MessageSquare } from "lucide-react"
import type { Restaurant } from "@/lib/types"

interface ReservationFormProps {
  restaurant: Restaurant
  selectedSlot: {
    date: string
    time: string
    partySize: number
  }
}

export function ReservationForm({ restaurant, selectedSlot }: ReservationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "Ali Ahmed",
    phone: "+92-300-1234567",
    email: "ali@example.com",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create reservation ID
    const reservationId = `res-${Date.now()}`

    // Store reservation for confirmation page
    sessionStorage.setItem(
      "pendingReservation",
      JSON.stringify({
        id: reservationId,
        restaurant,
        ...selectedSlot,
        ...formData,
        status: "pending",
      }),
    )

    router.push(`/pending/${reservationId}`)
  }

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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins text-[#262626] mb-2">Complete Your Reservation</h1>
        <p className="text-gray-600">You're almost done! Just fill in your details below.</p>
      </div>

      {/* Reservation Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Restaurant</span>
              <span className="font-medium">{restaurant.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </span>
              <span className="font-medium">{formatDate(selectedSlot.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Time</span>
              </span>
              <span className="font-medium">{selectedSlot.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Party Size</span>
              </span>
              <span className="font-medium">
                {selectedSlot.partySize} {selectedSlot.partySize === 1 ? "person" : "people"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4" />
                  <span>Full Name *</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number *</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="Optional - for confirmation email"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-4 w-4" />
                <span>Special Requests</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                placeholder="Any special requests or dietary requirements..."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Important:</strong> You'll receive an SMS confirmation within 5 minutes.
              </p>
              <p className="text-xs text-gray-500">By proceeding, you agree to our terms and conditions.</p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="btn-secondary w-full py-3 text-lg">
              {isSubmitting ? "Processing..." : "Confirm Reservation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
