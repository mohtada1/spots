"use client"

import { useEffect, useState, use } from "react"
import { ReservationForm } from "@/components/reservation/reservation-form"
import { mockRestaurants } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface ReservePageProps {
  params: Promise<{
    id: string
  }>
}

export default function ReservePage({ params }: ReservePageProps) {
  const { id } = use(params)
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
