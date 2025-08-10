import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { parseSlugId } from "@/lib/utils/slug"

export async function GET(
  request: NextRequest,
  { params }: { params: { 'slug-id': string } }
) {
  try {
    const { id } = parseSlugId(params['slug-id'])

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        images:restaurant_images(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid restaurant ID format' }, { status: 400 })
  }
}
