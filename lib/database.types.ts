export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          city: string
          cuisine: string[]
          halal: boolean
          price_level: string
          rating: number
          image_url: string | null
          description: string | null
          address: string | null
          phone: string | null
          available_slots: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          cuisine: string[]
          halal?: boolean
          price_level: string
          rating?: number
          image_url?: string | null
          description?: string | null
          address?: string | null
          phone?: string | null
          available_slots?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          cuisine?: string[]
          halal?: boolean
          price_level?: string
          rating?: number
          image_url?: string | null
          description?: string | null
          address?: string | null
          phone?: string | null
          available_slots?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          restaurant_id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status: "pending" | "confirmed" | "cancelled"
          special_requests: string | null
          confirmation_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          status?: "pending" | "confirmed" | "cancelled"
          special_requests?: string | null
          confirmation_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          status?: "pending" | "confirmed" | "cancelled"
          special_requests?: string | null
          confirmation_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
