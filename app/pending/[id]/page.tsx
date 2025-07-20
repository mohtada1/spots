"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { AwaitConfirmationBanner } from "@/components/reservation/await-confirmation-banner"
import type { Reservation } from "@/lib/types"

export default function PendingPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [reservation, setReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    const pendingReservation = sessionStorage.getItem("pendingReservation")
    if (pendingReservation) {
      const reservationData = JSON.parse(pendingReservation)
      if (reservationData.id === id) {
        setReservation(reservationData)
      }
    }
  }, [id])

  if (!reservation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AwaitConfirmationBanner reservation={reservation} />
    </div>
  )
}
