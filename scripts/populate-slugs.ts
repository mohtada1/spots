import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '../lib/utils/slug'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function populateSlugs() {
  console.log('Fetching restaurants without slugs...')
  
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, slug')
    .is('slug', null)

  if (error) {
    console.error('Error fetching restaurants:', error)
    return
  }

  console.log(`Found ${restaurants.length} restaurants without slugs`)

  for (const restaurant of restaurants) {
    const slug = generateSlug(restaurant.name)
    console.log(`Updating ${restaurant.name} -> ${slug}`)

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({ slug })
      .eq('id', restaurant.id)

    if (updateError) {
      console.error(`Error updating ${restaurant.name}:`, updateError)
    }
  }

  console.log('Slug population complete!')
}

populateSlugs().catch(console.error)
