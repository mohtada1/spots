"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import type { Restaurant } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface FeaturedCarouselProps {
  restaurants: Restaurant[]
}

export function FeaturedCarousel({ restaurants }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(restaurants.length / 3))
    }, 5000)

    return () => clearInterval(interval)
  }, [restaurants.length, isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(restaurants.length / 3))
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(restaurants.length / 3)) % Math.ceil(restaurants.length / 3))
    setIsAutoPlaying(false)
  }

  const visibleRestaurants = restaurants.slice(currentIndex * 3, (currentIndex + 1) * 3)

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-2">Featured Restaurants</h2>
            <p className="text-muted-foreground">Discover popular dining spots across Pakistan</p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleRestaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg group cursor-pointer border-0 shadow-md"
            >
              <Link href={`/restaurant/${restaurant.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=300&width=400`}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {restaurant.halal && (
                    <Badge className="absolute top-3 right-3 bg-foreground text-background rounded-full">Halal</Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-medium font-poppins mb-2 group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <span>{restaurant.priceLevel}</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.city}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{restaurant.cuisine.join(", ")}</p>
                  <Button className="booking-highlight rounded-xl w-full">View & Reserve</Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
