import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
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
    
    // Create completely isolated connection to bypass any caching
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    
    // Force new connection with unique identifier
    const connectionId = `${Date.now()}-${Math.random()}`
    console.log('API: Creating fresh connection:', connectionId)
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Connection-ID': connectionId,
          'X-Timestamp': Date.now().toString(),
        },
      },
    })

    // Verify the token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user || !user.email) {
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

    // Force fresh connection and fetch all reservations with restaurant data
    console.log('API: Fetching reservations at', new Date().toISOString())
    console.log('API: Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('API: Request token (first 20 chars):', token.substring(0, 20))
    console.log('API: User email from token:', user.email)
    
    // Use function that forces fresh data retrieval
    const queryTimestamp = Date.now()
    console.log('API: Query timestamp:', queryTimestamp)
    
    const { data: freshData, error: reservationsError } = await supabaseAdmin
      .rpc('get_fresh_reservations')
    
    // Transform the data back to expected format
    const reservations = freshData?.map((item: any) => item.reservation_data) || []

    if (reservationsError) {
      console.log('API: Reservations error:', reservationsError)
      throw reservationsError
    }

    console.log('API: Total reservations found:', reservations?.length || 0)
    console.log('API: Reservation IDs:', reservations?.map(r => r.id) || [])

    // Debug: Check specific reservation directly from database
    const { data: directCheck } = await supabaseAdmin
      .from("reservations")
      .select("id, customer_name, status, updated_at")
      .eq("customer_name", "asdasda")
      .single()
    
    console.log('API: Direct DB check for asdasda:', directCheck)
    
    // Debug: Log the asdasda reservation from the main query
    const asdasdaReservation = reservations?.find(r => r.customer_name === 'asdasda')
    if (asdasdaReservation) {
      console.log('API: asdasda from main query - status:', asdasdaReservation.status, 'updated_at:', asdasdaReservation.updated_at)
    }

    const response = NextResponse.json({
      success: true,
      data: reservations,
    })

    // Add aggressive cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('Vary', 'Authorization')
    response.headers.set('Last-Modified', new Date().toUTCString())
    response.headers.set('ETag', `"${Date.now()}"`)
    response.headers.set('X-Timestamp', Date.now().toString())

    return response
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
