import { supabase } from "./supabase"
import type { Restaurant, Reservation, SearchFilters } from "./types"

export const api = {
  // Restaurant operations
  async getRestaurants(filters?: Partial<SearchFilters>): Promise<Restaurant[]> {
    let query = supabase.from("restaurants").select("*")

    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`)
    }

    if (filters?.cuisine && filters.cuisine.length > 0) {
      query = query.overlaps("cuisine", filters.cuisine)
    }

    if (filters?.halal === true) {
      query = query.eq("halal", true)
    }

    if (filters?.priceLevel && filters.priceLevel.length > 0) {
      query = query.in("price_level", filters.priceLevel)
    }

    const { data, error } = await query.order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching restaurants:", error)
      throw new Error("Failed to fetch restaurants")
    }

    return data || []
  },

  async getRestaurant(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching restaurant:", error)
      return null
    }

    return data
  },

  // Reservation operations
  async createReservation(
    reservation: Omit<Reservation, "id" | "created_at" | "updated_at" | "confirmation_code">,
  ): Promise<Reservation> {
    // Generate confirmation code
    const confirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        ...reservation,
        confirmation_code: confirmationCode,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating reservation:", error)
      throw new Error("Failed to create reservation")
    }

    return data
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
