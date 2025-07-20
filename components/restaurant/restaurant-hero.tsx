"use client"

import Image from "next/image"
import { Star, MapPin, Phone, Clock, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Restaurant } from "@/lib/types"

interface RestaurantHeroProps {
  restaurant: Restaurant
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative h-64 md:h-96 rounded-food-small overflow-hidden bg-gray-100">
            <Image
              src={restaurant.image_url || '/placeholder.svg?height=600&width=800'}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg?height=600&width=800';
              }}
            />
            {restaurant.halal && (
              <Badge className="absolute top-4 right-4 bg-foreground text-background rounded-full">
                Halal Certified
              </Badge>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="space-y-food-lg">
            <div>
              <div className="flex items-start justify-between mb-food-md">
                <h1 className="text-3xl md:text-4xl font-bold font-poppins text-food-text">{restaurant.name}</h1>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-gray-600 mb-food-md">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-food-primary text-food-primary" />
                  <span className="font-medium">{restaurant.rating}</span>
                  <span className="text-sm">(124 reviews)</span>
                </div>
                <span className="text-lg font-medium">{restaurant.price_level}</span>
              </div>

              <div className="space-y-food-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address || `${restaurant.city}, Pakistan`}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.phone || "+92-XXX-XXXXXXX"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Open until 11:00 PM</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-food-sm text-food-text">Cuisine</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((cuisine) => (
                  <Badge key={cuisine} variant="outline" className="rounded-full">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            {restaurant.description && (
              <div>
                <h3 className="text-lg font-semibold mb-food-sm text-food-text">About</h3>
                <p className="text-gray-600 leading-relaxed">{restaurant.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
