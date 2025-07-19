import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurant_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      reservation_time,
      special_requests
    } = body

    // Validate required fields
    if (!restaurant_id || !customer_name || !customer_phone || !customer_email || !party_size || !reservation_date || !reservation_time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate confirmation code
    const confirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase()

    // Create reservation in Supabase
    const { data: reservation, error } = await supabase
      .from("reservations")
      .insert({
        restaurant_id,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        reservation_time,
        special_requests: special_requests || null,
        confirmation_code: confirmationCode,
        status: "pending",
      })
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .single()

    if (error) {
      console.error("Error creating reservation:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create reservation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error) {
    console.error("Error in reservations API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
