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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(restaurants.length / 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(restaurants.length / 3)) % Math.ceil(restaurants.length / 3))
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
              className="rounded-food-small overflow-hidden transition-shadow duration-200 hover:shadow-md group cursor-pointer border-0 shadow-sm bg-food-background"
            >
              <Link href={`/restaurant/${restaurant.id}`}>
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={restaurant.image_url || '/placeholder.svg?height=300&width=400'}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg?height=300&width=400';
                    }}
                  />
                  {restaurant.halal && (
                    <Badge className="absolute top-3 right-3 bg-foreground text-background rounded-full">Halal</Badge>
                  )}
                </div>
                <CardContent className="p-food-md">
                  <h3 className="text-xl font-medium font-poppins mb-food-sm group-hover:text-food-primary transition-colors duration-200 text-food-text">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-food-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-food-primary text-food-primary" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <span>{restaurant.price_level}</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.city}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-food-md">{restaurant.cuisine.join(", ")}</p>
                  <Button className="w-full">View & Reserve</Button>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
