"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Users, User, Phone, MessageSquare, CheckCircle } from "lucide-react"
import type { Restaurant } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface BookingDialogProps {
  restaurant: Restaurant
  selectedSlot: {
    date: string
    time: string
    partySize: number
  }
  isOpen: boolean
  onClose: () => void
}

export function BookingDialog({ restaurant, selectedSlot, isOpen, onClose }: BookingDialogProps) {
  const [step, setStep] = useState<"form" | "processing" | "confirmed">("form")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "Ali Ahmed",
    phone: "+92-300-1234567",
    email: "ali@example.com",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStep("processing")

    try {
      // Create actual reservation in Supabase
      const reservation = await api.createReservation({
        restaurant_id: restaurant.id,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        party_size: selectedSlot.partySize,
        reservation_date: selectedSlot.date,
        reservation_time: selectedSlot.time,
        special_requests: formData.notes || null,
      })

      // Store reservation for confirmation page
      sessionStorage.setItem(
        "pendingReservation",
        JSON.stringify({
          ...reservation,
          restaurant,
        }),
      )

      // Set confirmation code for display
      setConfirmationCode(reservation.confirmation_code)
      setStep("confirmed")
      setIsSubmitting(false)

      // Show success toast
      toast({
        title: "Reservation Created!",
        description: `Your table at ${restaurant.name} has been reserved. Confirmation code: ${reservation.confirmation_code}`,
        variant: "default",
        duration: 8000,
      })

      // Redirect to pending page after delay
      setTimeout(() => {
        onClose()
        router.push(`/pending/${reservation.id}`)
      }, 3000)
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      setIsSubmitting(false)
      setStep("form")
      
      toast({
        title: "Reservation Failed",
        description: "Sorry, we couldn't process your reservation. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const resetDialog = () => {
    setStep("form")
    setIsSubmitting(false)
    setConfirmationCode(null)
    setFormData({
      name: "Ali Ahmed",
      phone: "+92-300-1234567",
      email: "ali@example.com",
      notes: "",
    })
  }

  const handleClose = () => {
    resetDialog()
    onClose()
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-xl p-0 overflow-hidden">
        {step === "form" && (
          <>
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold">Complete Your Reservation</DialogTitle>
              <DialogDescription>
                You're booking a table at <span className="font-medium">{restaurant.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-2">
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Date</span>
                    </span>
                    <span className="font-medium">{formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Time</span>
                    </span>
                    <span className="font-medium">{selectedSlot.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>Party Size</span>
                    </span>
                    <span className="font-medium">
                      {selectedSlot.partySize} {selectedSlot.partySize === 1 ? "person" : "people"}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="rounded-xl"
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
                      className="rounded-xl"
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
                    className="rounded-xl"
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
                    className="rounded-xl"
                    placeholder="Any special requests or dietary requirements..."
                    rows={3}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="booking-highlight rounded-xl">
                    Confirm Reservation
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 border-4 border-muted-foreground/20 border-t-foreground rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Processing Your Reservation</h3>
              <p className="text-muted-foreground">We're contacting {restaurant.name} to confirm your table...</p>
            </div>
          </div>
        )}

        {step === "confirmed" && (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reservation Confirmed!</h3>
              <p className="text-muted-foreground mb-4">
                Your table at {restaurant.name} has been reserved. Check your phone for SMS confirmation.
              </p>
              {confirmationCode && (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Your confirmation code:</p>
                  <p className="font-mono text-lg font-semibold">{confirmationCode}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (confirmationCode) {
                      router.push(`/pending/${confirmationCode}`)
                    }
                  }} 
                  className="booking-highlight rounded-xl"
                  disabled={!confirmationCode}
                >
                  Check Status
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
