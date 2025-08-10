import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { createSlugId } from '@/lib/utils/slug'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spotspk.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Dynamic restaurant pages
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, slug, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching restaurants for sitemap:', error)
      return staticPages
    }

    const restaurantPages: MetadataRoute.Sitemap = restaurants.map((restaurant) => {
      const slugId = createSlugId(restaurant.name, restaurant.id)
      
      return {
        url: `${baseUrl}/restaurants/${slugId}`,
        lastModified: restaurant.updated_at ? new Date(restaurant.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }
    })

    // City-based pages (for local SEO)
    const { data: cities } = await supabase
      .from('restaurants')
      .select('city')
      .not('city', 'is', null)

    const uniqueCities = [...new Set(cities?.map(r => r.city) || [])]
    const cityPages: MetadataRoute.Sitemap = uniqueCities.map((city) => ({
      url: `${baseUrl}/search?city=${encodeURIComponent(city)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Cuisine-based pages
    const { data: cuisineData } = await supabase
      .from('restaurants')
      .select('cuisine')
      .not('cuisine', 'is', null)

    const allCuisines = cuisineData?.flatMap(r => r.cuisine || []) || []
    const uniqueCuisines = [...new Set(allCuisines)]
    const cuisinePages: MetadataRoute.Sitemap = uniqueCuisines.map((cuisine) => ({
      url: `${baseUrl}/search?cuisine=${encodeURIComponent(cuisine)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...restaurantPages, ...cityPages, ...cuisinePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
