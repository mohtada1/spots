"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Clock } from "lucide-react"
import type { Restaurant } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface RestaurantCardListProps {
  restaurants: Restaurant[]
  isLoading?: boolean
}

export function RestaurantCardList({ restaurants, isLoading }: RestaurantCardListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-xl border-0 shadow-md">
            <div className="flex flex-col md:flex-row">
              <Skeleton className="h-48 md:h-32 md:w-48 rounded-none md:rounded-l-xl" />
              <div className="flex-1 p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🍽️</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
        <Button variant="outline" className="rounded-xl">
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {restaurants.map((restaurant) => (
        <Card
          key={restaurant.id}
          className="rounded-food-small overflow-hidden transition-shadow duration-200 hover:shadow-md group border-0 shadow-sm bg-food-background"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative h-48 md:h-32 md:w-48 overflow-hidden bg-gray-100">
              <Image
                src={restaurant.image_url || '/placeholder.svg?height=200&width=200'}
                alt={restaurant.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg?height=200&width=200';
                }}
              />

            </div>

            <CardContent className="flex-1 p-food-md md:p-food-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <h3 className="text-xl font-medium font-poppins mb-food-sm group-hover:text-food-primary transition-colors duration-200 cursor-pointer text-food-text">
                      {restaurant.name}
                    </h3>
                  </Link>

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

                  <p className="text-gray-600 text-sm mb-food-sm">{restaurant.cuisine.join(", ")}</p>

                  {restaurant.description && (
                    <p className="text-gray-600 text-sm mb-food-md">{restaurant.description}</p>
                  )}

                  <div className="flex items-center space-x-1 text-sm text-food-primary">
                    <Clock className="h-4 w-4" />
                    <span>Available today</span>
                  </div>
                </div>

                <div className="mt-food-md md:mt-0 md:ml-food-lg">
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <Button className="w-full md:w-auto">View & Reserve</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}
