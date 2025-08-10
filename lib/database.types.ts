export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          confirmation_code: string
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          party_size: number
          reservation_date: string
          reservation_time: string
          restaurant_id: string | null
          special_requests: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          confirmation_code?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          party_size: number
          reservation_date: string
          reservation_time: string
          restaurant_id?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          confirmation_code?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_images: {
        Row: {
          alt_text: string | null
          blob_url: string
          created_at: string | null
          display_order: number | null
          file_size: number | null
          id: string
          is_primary: boolean | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          blob_url: string
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          blob_url?: string
          created_at?: string | null
          display_order?: number | null
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          city: string
          created_at: string | null
          cuisine: string[]
          description: string | null
          id: string
          location: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          price_level: string
          rating: number | null
          slug: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string | null
          cuisine: string[]
          description?: string | null
          id?: string
          location?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          price_level: string
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string | null
          cuisine?: string[]
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          price_level?: string
          rating?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          title: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_categories: {
        Row: {
          restaurant_id: string
          category_id: string
          created_at: string | null
        }
        Insert: {
          restaurant_id: string
          category_id: string
          created_at?: string | null
        }
        Update: {
          restaurant_id?: string
          category_id?: string
          created_at?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never