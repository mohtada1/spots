import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get query parameters for filtering
    const city = searchParams.get('city')
    const cuisine = searchParams.get('cuisine')

    const priceLevel = searchParams.get('price_level')

    let query = supabase
      .from("restaurants")
      .select(`
        *,
        images:restaurant_images(
          id,
          blob_url,
          alt_text,
          display_order,
          is_primary
        )
      `)

    // Apply filters
    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    if (cuisine) {
      const cuisineArray = cuisine.split(',')
      query = query.overlaps("cuisine", cuisineArray)
    }



    if (priceLevel) {
      const priceLevels = priceLevel.split(',')
      query = query.in("price_level", priceLevels)
    }

    const { data: restaurants, error } = await query.order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching restaurants:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch restaurants" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: restaurants || [],
    })
  } catch (error) {
    console.error("Error in restaurants API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
