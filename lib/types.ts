export interface RestaurantImage {
  id: string
  blob_url: string
  alt_text: string | null
  display_order: number | null
  is_primary: boolean | null
}

export interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number | null
  address: string | null
  city: string
  price_level: string
  description: string | null
  opening_hours: string | null
  phone: string | null
  website?: string
  created_at: string | null
  updated_at: string | null
  images?: RestaurantImage[]
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
  priceLevel: string[]
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
