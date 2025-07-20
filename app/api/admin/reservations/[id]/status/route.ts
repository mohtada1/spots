import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

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
    const { status } = await request.json()
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

    // Update reservation status
    const { data: reservation, error: updateError } = await supabaseAdmin
      .from("reservations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
