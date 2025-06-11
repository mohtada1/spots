export interface Restaurant {
  id: string
  name: string
  city: string
  cuisine: string[]
  halal: boolean
  priceLevel: string
  rating: number
  imageUrl: string
  availableSlots: string[]
  description?: string
  address?: string
  phone?: string
}

export interface Reservation {
  id: string
  restaurantId: string
  userId: string
  partySize: number
  slot: string
  status: "pending" | "confirmed" | "cancelled"
  customerName: string
  customerPhone: string
  notes?: string
  restaurant?: Restaurant
}

export interface SearchFilters {
  city: string
  cuisine: string[]
  halal: boolean | null
  priceLevel: string[]
}
