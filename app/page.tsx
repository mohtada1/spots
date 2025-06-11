"use client"

import { HeroSearchBar } from "@/components/home/hero-search-bar"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { mockRestaurants } from "@/lib/mock-data"

export default function HomePage() {
  const handleSearch = (query: string) => {
    console.log("Search query:", query)
  }

  return (
    <div>
      <HeroSearchBar onSearch={handleSearch} />
      <FeaturedCarousel restaurants={mockRestaurants} />

      {/* Trust Indicators */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold font-poppins mb-8">Why Choose Spots?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-background text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Booking</h3>
              <p className="text-muted-foreground">Reserve your table in under 60 seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-background text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">SMS Confirmation</h3>
              <p className="text-muted-foreground">Get instant confirmation via SMS</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-background text-2xl">🇵🇰</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Local Focus</h3>
              <p className="text-muted-foreground">Curated restaurants across Pakistan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
