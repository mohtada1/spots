import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import type { Restaurant } from "@/lib/types"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const restaurantData: Partial<Restaurant> = await request.json()
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

    // Update restaurant
    const { data: restaurant, error: updateError } = await supabaseAdmin
      .from("restaurants")
      .update({
        ...restaurantData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    })
  } catch (error) {
    console.error("Error updating restaurant:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Delete restaurant
    const { error: deleteError } = await supabaseAdmin.from("restaurants").delete().eq("id", id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting restaurant:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
