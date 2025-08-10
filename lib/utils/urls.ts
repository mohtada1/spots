import { generateSlug, createSlugId } from './slug'

export function getRestaurantUrl(restaurant: { id: string; name: string; slug?: string }): string {
  const slug = restaurant.slug || generateSlug(restaurant.name)
  return `/restaurants/${slug}-${restaurant.id}`
}

export function getReservationUrl(restaurantId: string, restaurantName: string): string {
  const slug = generateSlug(restaurantName)
  return `/reserve/${slug}-${restaurantId}`
}
