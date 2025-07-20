import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    // Fetch all reservations with restaurant data
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from("reservations")
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .order("created_at", { ascending: false })

    if (reservationsError) {
      throw reservationsError
    }

    return NextResponse.json({
      success: true,
      data: reservations,
    })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
