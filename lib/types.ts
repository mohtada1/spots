export interface Restaurant {
  id: string
  name: string
  city: string
  cuisine: string[]
  halal: boolean
  price_level: string
  rating: number
  image_url: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  available_slots: string[]
  created_at?: string
  updated_at?: string
}

export interface Reservation {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: "pending" | "confirmed" | "cancelled"
  special_requests?: string | null
  confirmation_code: string
  created_at?: string
  updated_at?: string
  restaurant?: Restaurant
}

export interface SearchFilters {
  city: string
  cuisine: string[]
  halal: boolean | null
  priceLevel: string[]
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
