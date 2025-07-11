"use client"

import { useEffect, useState } from "react"
import { AwaitConfirmationBanner } from "@/components/reservation/await-confirmation-banner"
import type { Reservation } from "@/lib/types"
import { notFound } from "next/navigation"

interface PendingPageProps {
  params: {
    id: string
  }
}

export default function PendingPage({ params }: PendingPageProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    const pendingReservation = sessionStorage.getItem("pendingReservation")
    if (pendingReservation) {
      const reservationData = JSON.parse(pendingReservation)
      if (reservationData.id === params.id) {
        setReservation(reservationData)
      }
    }
  }, [params.id])

  if (!reservation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AwaitConfirmationBanner reservation={reservation} />
    </div>
  )
}
