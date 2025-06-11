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
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg group border-0 shadow-md"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative h-48 md:h-32 md:w-48 overflow-hidden">
              <Image
                src={restaurant.imageUrl || "/placeholder.svg"}
                alt={restaurant.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {restaurant.halal && (
                <Badge className="absolute top-2 right-2 bg-foreground text-background rounded-full">Halal</Badge>
              )}
            </div>

            <CardContent className="flex-1 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <h3 className="text-xl font-medium font-poppins mb-2 group-hover:text-primary transition-colors cursor-pointer">
                      {restaurant.name}
                    </h3>
                  </Link>

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

                  <p className="text-muted-foreground text-sm mb-2">{restaurant.cuisine.join(", ")}</p>

                  {restaurant.description && (
                    <p className="text-muted-foreground text-sm mb-3">{restaurant.description}</p>
                  )}

                  <div className="flex items-center space-x-1 text-sm text-primary">
                    <Clock className="h-4 w-4" />
                    <span>Available today</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6">
                  <Link href={`/restaurant/${restaurant.id}`}>
                    <Button className="booking-highlight rounded-xl w-full md:w-auto">View & Reserve</Button>
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
