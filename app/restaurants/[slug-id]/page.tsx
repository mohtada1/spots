import { notFound } from "next/navigation"

import { ImageGallery } from "@/components/ui/image-gallery"
import { RestaurantBooking } from "@/components/restaurant/restaurant-booking"
import { supabase } from "@/lib/supabase"
import { parseSlugId } from "@/lib/utils/slug"
import { MapPin, Phone, Clock } from "lucide-react"
import type { Restaurant } from "@/lib/types"
import type { Metadata } from "next"

async function getRestaurant(id: string): Promise<Restaurant | null> {
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
    return null
  }

  return restaurant
}

export async function generateMetadata({ params }: { params: { 'slug-id': string } }): Promise<Metadata> {
  try {
    const { id } = parseSlugId(params['slug-id'])
    const restaurant = await getRestaurant(id)
    
    if (!restaurant) {
      return {
        title: 'Restaurant Not Found | Spots',
        description: 'The restaurant you are looking for could not be found.'
      }
    }

    return {
      title: `${restaurant.name} - Book a Table | Spots`,
      description: `Reserve a table at ${restaurant.name}. ${restaurant.description || `Experience fine dining at ${restaurant.name} in ${restaurant.address}.`}`,
      openGraph: {
        title: restaurant.name,
        description: restaurant.description || `Book a table at ${restaurant.name}`,
        images: restaurant.images?.[0] ? [{ url: restaurant.images[0].blob_url }] : [],
        type: 'website'
      }
    }
  } catch (error) {
    return {
      title: 'Restaurant | Spots',
      description: 'Book a table at your favorite restaurant'
    }
  }
}

export default async function RestaurantPage({ params }: { params: { 'slug-id': string } }) {
  let id: string
  try {
    const parsed = parseSlugId(params['slug-id'])
    id = parsed.id
    console.log('Parsed slug-id:', params['slug-id'], '→', parsed)
  } catch (error) {
    console.error('Failed to parse slug-id:', params['slug-id'], error)
    notFound()
  }

  const restaurant = await getRestaurant(id)
  
  if (!restaurant) {
    console.error('Restaurant not found for ID:', id)
    notFound()
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address
    },
    "telephone": restaurant.phone,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/restaurants/${params['slug-id']}`,
    "image": restaurant.images?.[0],
    "description": restaurant.description
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-background">
        {/* Restaurant Image Gallery */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <ImageGallery 
                images={restaurant.images || []} 
                restaurantName={restaurant.name}
                className="w-full"
              />
            </div>
          </div>

          {/* Restaurant Info and Reservation Layout */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Restaurant Info/Bio - Left Side */}
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-poppins text-food-text">{restaurant.name}</h1>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-red-500">★</span>
                      <span className="font-medium">{restaurant.rating || 'N/A'}</span>
                      <span className="text-sm">(124 reviews)</span>
                    </div>
                    <span className="text-lg font-medium">{restaurant.price_level}</span>
                  </div>

                  <div className="space-y-2 text-gray-600 mb-6">
                    {(restaurant.address || restaurant.city) && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{restaurant.address ? `${restaurant.address}, ${restaurant.city}` : restaurant.city}</span>
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    {restaurant.opening_hours && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{restaurant.opening_hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-food-text">Cuisine</h3>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisine.map((cuisineType, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm border">
                          {cuisineType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {restaurant.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-food-text">About</h3>
                    <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
                  </div>
                )}
              </div>

              {/* Reservation Widget - Right Side */}
              <div className="lg:col-span-2">
                <RestaurantBooking restaurant={restaurant} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
