"use client"

import { useEffect, useState } from "react"
import { ReservationForm } from "@/components/reservation/reservation-form"
import { mockRestaurants } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface ReservePageProps {
  params: {
    id: string
  }
}

export default function ReservePage({ params }: ReservePageProps) {
  const [reservationDetails, setReservationDetails] = useState<any>(null)
  const restaurant = mockRestaurants.find((r) => r.id === params.id)

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
