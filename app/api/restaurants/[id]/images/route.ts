import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: images, error } = await supabase
      .from("restaurant_images")
      .select("*")
      .eq("restaurant_id", id)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching restaurant images:", error)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error in restaurant images API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
