import { notFound } from "next/navigation"
import { ReservationForm } from "@/components/reservation/reservation-form"
import { parseSlugId } from "@/lib/utils/slug"
import { supabase } from "@/lib/supabase"
import type { Restaurant } from "@/lib/types"

async function getRestaurant(id: string): Promise<Restaurant | null> {
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      images:restaurant_images(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Database error:', error)
    return null
  }

  return restaurant
}

export default async function ReservePage({ params }: { params: { 'slug-id': string } }) {
  let id: string
  try {
    ({ id } = parseSlugId(params['slug-id']))
  } catch (error) {
    notFound()
  }

  const restaurant = await getRestaurant(id)
  
  if (!restaurant) {
    notFound()
  }

  // Note: In a real app, you'd pass reservation details via URL params or a different method
  // since sessionStorage is not available in server components
  const reservationDetails = {
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    partySize: 2
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
