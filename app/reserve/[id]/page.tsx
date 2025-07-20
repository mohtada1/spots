"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { ReservationForm } from "@/components/reservation/reservation-form"
import { mockRestaurants } from "@/lib/mock-data"

export default function ReservePage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [reservationDetails, setReservationDetails] = useState<any>(null)
  const restaurant = mockRestaurants.find((r) => r.id === id)

  useEffect(() => {
    const details = sessionStorage.getItem("reservationDetails")
    if (details) {
      setReservationDetails(JSON.parse(details))
    }
  }, [])

  if (!restaurant || !reservationDetails) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationForm
        restaurant={restaurant}
        selectedSlot={{
          date: reservationDetails.date,
          time: reservationDetails.time,
          partySize: reservationDetails.partySize,
        }}
      />
    </div>
  )
}
