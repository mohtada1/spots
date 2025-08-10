import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurant_categories')
      .select(`
        restaurants (
          id,
          name,
          cuisine,
          rating,
          address,
          city,
          price_level,
          description,
          opening_hours,
          phone,
          location,
          website,
          created_at,
          updated_at
        )
      `)
      .eq('category_id', params.id)

    if (error) {
      console.error('Error fetching restaurants by category:', error)
      return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
    }

    // Extract restaurants from the join result
    const restaurantList = restaurants?.map(item => item.restaurants).filter(Boolean) || []

    return NextResponse.json(restaurantList)
  } catch (error) {
    console.error('Error in category restaurants GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { restaurant_ids } = body

    if (!Array.isArray(restaurant_ids)) {
      return NextResponse.json({ error: 'restaurant_ids must be an array' }, { status: 400 })
    }

    // Insert restaurant-category relationships
    const relationships = restaurant_ids.map(restaurant_id => ({
      restaurant_id,
      category_id: params.id
    }))

    const { data, error } = await supabase
      .from('restaurant_categories')
      .upsert(relationships, { onConflict: 'restaurant_id,category_id' })

    if (error) {
      console.error('Error adding restaurants to category:', error)
      return NextResponse.json({ error: 'Failed to add restaurants to category' }, { status: 500 })
    }

    return NextResponse.json({ success: true, added: restaurant_ids.length })
  } catch (error) {
    console.error('Error in category restaurants POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
