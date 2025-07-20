import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
import type { Restaurant } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const supabaseAdmin = createAdminClient()

    // Verify the token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    // Fetch all restaurants
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false })

    if (restaurantsError) {
      throw restaurantsError
    }

    return NextResponse.json({
      success: true,
      data: restaurants,
    })
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const restaurantData: Omit<Restaurant, "id" | "created_at" | "updated_at"> = await request.json()
    const supabaseAdmin = createAdminClient()

    // Verify the token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    // Create new restaurant
    const { data: restaurant, error: createError } = await supabaseAdmin
      .from("restaurants")
      .insert(restaurantData)
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
