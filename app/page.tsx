"use client"

import { useState, useEffect } from "react"
import { HeroSearchBar } from "@/components/home/hero-search-bar"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { api } from "@/lib/api"
import type { Restaurant } from "@/lib/types"

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      const data = await api.getRestaurants()
      setRestaurants(data)
    } catch (error) {
      console.error("Error loading restaurants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    console.log("Search query:", query)
  }

  return (
    <div>
      <HeroSearchBar onSearch={handleSearch} />
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
        </div>
      ) : (
        <FeaturedCarousel restaurants={restaurants} />
      )}

      {/* Trust Indicators */}
      <section className="py-food-2xl bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-poppins mb-food-xl text-gray-800">Why Choose Spots?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-food-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-food-primary rounded-full flex items-center justify-center mx-auto mb-food-md">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-food-sm text-gray-800">Instant Booking</h3>
              <p className="text-gray-600">Reserve your table in under 60 seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-food-primary rounded-full flex items-center justify-center mx-auto mb-food-md">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-food-sm text-gray-800">SMS Confirmation</h3>
              <p className="text-gray-600">Get instant confirmation via SMS</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-food-primary rounded-full flex items-center justify-center mx-auto mb-food-md">
                <span className="text-white text-2xl">🇵🇰</span>
              </div>
              <h3 className="text-xl font-semibold mb-food-sm text-gray-800">Local Focus</h3>
              <p className="text-gray-600">Curated restaurants across Pakistan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
