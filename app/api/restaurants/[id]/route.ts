import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        images:restaurant_images(
          id,
          blob_url,
          alt_text,
          display_order,
          is_primary
        ).order(is_primary.desc, display_order.asc)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { success: false, error: "Restaurant not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching restaurant:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch restaurant" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    })
  } catch (error) {
    console.error("Error in restaurant API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
