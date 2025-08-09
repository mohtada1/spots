import { supabase } from "./supabase"
import type { Restaurant, Reservation, SearchFilters } from "./types"

export const api = {
  // Restaurant operations
  async getRestaurants(filters?: Partial<SearchFilters>): Promise<Restaurant[]> {
    try {
      const searchParams = new URLSearchParams()
      
      if (filters?.city) {
        searchParams.append('city', filters.city)
      }
      
      if (filters?.cuisine && filters.cuisine.length > 0) {
        searchParams.append('cuisine', filters.cuisine.join(','))
      }
      

      
      if (filters?.priceLevel && filters.priceLevel.length > 0) {
        searchParams.append('price_level', filters.priceLevel.join(','))
      }

      const response = await fetch(`/api/restaurants?${searchParams.toString()}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch restaurants')
      }
      
      return result.data || []
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      throw new Error("Failed to fetch restaurants")
    }
  },

  async getRestaurant(id: string): Promise<Restaurant | null> {
    if (!id) {
      console.error('No restaurant ID provided')
      return null
    }
    
    try {
      const response = await fetch(`/api/restaurants/${encodeURIComponent(id)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch restaurant')
      }
      
      return result.data
    } catch (error) {
      console.error("Error fetching restaurant:", error)
      return null
    }
  },

  // Reservation operations
  async createReservation(
    reservation: Omit<Reservation, "id" | "created_at" | "updated_at" | "confirmation_code" | "status">,
  ): Promise<Reservation> {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create reservation')
      }
      
      return result.data
    } catch (error) {
      console.error("Error creating reservation:", error)
      throw new Error("Failed to create reservation")
    }
  },

  async getReservationByCode(confirmationCode: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .eq("confirmation_code", confirmationCode)
      .single()

    if (error) {
      console.error("Error fetching reservation:", error)
      return null
    }

    return data
  },

  // Admin operations (these will be moved to server-side API routes)
  async getAllReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reservations:", error)
      throw new Error("Failed to fetch reservations")
    }

    return data || []
  },

  async updateReservationStatus(id: string, status: "pending" | "confirmed" | "cancelled"): Promise<Reservation> {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .single()

    if (error) {
      console.error("Error updating reservation:", error)
      throw new Error("Failed to update reservation")
    }

    return data
  },
}
