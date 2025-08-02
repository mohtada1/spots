"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, Clock, Users, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import type { Restaurant, SearchFilters } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("All Restaurants")
  const [location, setLocation] = useState("San Francisco, CA")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [partySize, setPartySize] = useState("")
  const router = useRouter()

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching with:", { location, date, time, partySize })
  }

  // Navigate to restaurant detail page
  const handleRestaurantClick = (restaurantId: string) => {
    router.push(`/restaurant/${restaurantId}`)
  }

  // Filter restaurants by category - using actual data properties
  const getRestaurantsByCategory = (category: string) => {
    switch (category) {
      case "featured":
        // Get top-rated restaurants as "featured"
        return restaurants.filter(r => r.rating >= 4.5).slice(0, 4)
      case "nearby":
        // Get restaurants with available slots as "nearby & available"
        return restaurants.filter(r => r.available_slots && r.available_slots.length > 0).slice(0, 4)
      case "topRated":
        return restaurants.filter(r => r.rating >= 4.7).sort((a, b) => b.rating - a.rating).slice(0, 4)
      case "bookNow":
        // Get restaurants with limited slots as "book now"
        return restaurants.filter(r => r.available_slots && r.available_slots.length <= 2).slice(0, 4)
      default:
        return restaurants.slice(0, 4)
    }
  }

  // Restaurant card component for horizontal carousels
  const RestaurantCard = ({ restaurant, showBadge = false, badgeText = "", badgeColor = "bg-red-500" }: { 
    restaurant: Restaurant, 
    showBadge?: boolean, 
    badgeText?: string,
    badgeColor?: string 
  }) => (
    <Card 
      className="w-72 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow duration-200 border-0 bg-white rounded-xl overflow-hidden cursor-pointer"
      onClick={() => handleRestaurantClick(restaurant.id)}
    >
      <CardContent className="p-0">
        {/* Restaurant Image */}
        <div className="relative h-32 bg-gray-200">
          {restaurant.image_url ? (
            <img 
              src={restaurant.image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder on image error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback placeholder - shown when no image_url or on error */}
          <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${restaurant.image_url ? 'hidden' : ''}`}>
            <span className="text-gray-400 text-2xl">🍽️</span>
          </div>
          
          {/* Status Badge */}
          {showBadge && (
            <div className="absolute top-2 left-2">
              <Badge className={`text-xs font-medium text-white ${badgeColor} hover:${badgeColor}`}>
                {badgeText}
              </Badge>
            </div>
          )}
        </div>

        {/* Restaurant Details */}
        <div className="p-3">
          {/* Name and Rating */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-sm text-gray-900 leading-tight flex-1 mr-2">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Cuisine and Price */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">
              {restaurant.cuisine.join(", ")}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs font-medium text-gray-700">
              {restaurant.price_level}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {restaurant.city}
            </span>
          </div>

          {/* Availability Times */}
          <div className="flex gap-1">
            {restaurant.available_slots && restaurant.available_slots.length > 0 ? (
              restaurant.available_slots.slice(0, 2).map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                  {slot}
                </Badge>
              ))
            ) : (
              <>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  7:00 PM
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  8:00 PM
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Restaurant card component for grid layout
  const RestaurantGridCard = ({ restaurant }: { restaurant: Restaurant }) => {
    // Determine badge based on restaurant properties
    const getBadgeInfo = () => {
      if (restaurant.rating >= 4.5) {
        return { show: true, text: "Featured", color: "bg-red-500" }
      }
      if (restaurant.available_slots && restaurant.available_slots.length > 0) {
        return { show: true, text: "Available", color: "bg-green-500" }
      }
      if (restaurant.available_slots && restaurant.available_slots.length <= 2) {
        return { show: true, text: "Almost Full", color: "bg-orange-500" }
      }
      return { show: false, text: "", color: "" }
    }

    const badgeInfo = getBadgeInfo()

    return (
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow duration-200 border-0 bg-white rounded-xl overflow-hidden cursor-pointer"
        onClick={() => handleRestaurantClick(restaurant.id)}
      >
        <CardContent className="p-0">
          {/* Restaurant Image */}
          <div className="relative h-48 bg-gray-200">
            {restaurant.image_url ? (
              <img 
                src={restaurant.image_url} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to placeholder on image error
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback placeholder - shown when no image_url or on error */}
            <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${restaurant.image_url ? 'hidden' : ''}`}>
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
            
            {/* Status Badge */}
            {badgeInfo.show && (
              <div className="absolute top-3 left-3">
                <Badge className={`text-xs font-medium text-white ${badgeInfo.color} hover:${badgeInfo.color}`}>
                  {badgeInfo.text}
                </Badge>
              </div>
            )}
          </div>

          {/* Restaurant Details */}
          <div className="p-4">
            {/* Name and Rating */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-base text-gray-900 leading-tight flex-1 mr-2">
                {restaurant.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">{restaurant.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Cuisine and Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">
                {restaurant.cuisine.join(", ")}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm font-medium text-gray-700">
                {restaurant.price_level}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {restaurant.city}
              </span>
            </div>

            {/* Availability Times */}
            <div className="flex gap-1 flex-wrap">
              {restaurant.available_slots && restaurant.available_slots.length > 0 ? (
                restaurant.available_slots.slice(0, 3).map((slot, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                    {slot}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    7:00 PM
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    8:00 PM
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +1
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter restaurants based on selected cuisine
  const getFilteredRestaurants = () => {
    if (selectedCuisine === "All Restaurants") {
      return restaurants
    }
    return restaurants.filter(restaurant => 
      restaurant.cuisine.some(cuisine => 
        cuisine.toLowerCase() === selectedCuisine.toLowerCase()
      )
    )
  }

  // Cuisine filter pills
  const cuisineFilters = ["All Restaurants", "Italian", "Japanese", "French", "American", "Mexican", "Seafood", "Mediterranean", "Chinese", "Korean", "Indian"]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 className="text-xl font-bold text-red-500">Spots</h1>
        <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
          Sign In
        </Button>
      </header>

      {/* Hero Section with Background Image */}
      <div className="relative h-64 bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Find your next table</h2>
          <p className="text-lg mb-8 text-center opacity-90">Book restaurants in your city</p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 border-gray-300"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
                
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                
                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
                
                {/* Party Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      className="pl-10 border-gray-300"
                      placeholder="2"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
              </div>
              
              {/* Search Button */}
              <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white py-3">
                <Search className="w-4 h-4 mr-2" />
                Find Tables
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Restaurants in San Francisco ({restaurants.length} found)
          </h3>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Cuisine Filter Pills */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cuisineFilters.map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisine === cuisine ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine(cuisine)}
              className={`whitespace-nowrap flex-shrink-0 ${
                selectedCuisine === cuisine 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </div>

      {/* Restaurant Sections */}
      <div className="pb-8">
        {isLoading ? (
          // Loading State
          <div className="space-y-8 mt-6">
            {[...Array(4)].map((_, sectionIndex) => (
              <div key={sectionIndex} className="px-4">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[...Array(4)].map((_, cardIndex) => (
                    <div key={cardIndex} className="w-72 flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="h-32 bg-gray-200 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            {/* Featured Section */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Featured</h2>
                <span className="text-sm text-gray-600">Handpicked by our experts</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {getRestaurantsByCategory("featured").map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    showBadge={true}
                    badgeText="Featured"
                    badgeColor="bg-red-500"
                  />
                ))}
              </div>
            </section>

            {/* Nearby & Available Section */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Nearby & Available</h2>
                <span className="text-sm text-gray-600">Close to you with open tables</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {getRestaurantsByCategory("nearby").map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    showBadge={true}
                    badgeText="Available"
                    badgeColor="bg-green-500"
                  />
                ))}
              </div>
            </section>

            {/* Top Rated Section */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Top Rated</h2>
                <span className="text-sm text-gray-600">Highest rated restaurants</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {getRestaurantsByCategory("topRated").map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </section>

            {/* Book Now Section */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Book Now</h2>
                <span className="text-sm text-gray-600">Limited availability - reserve quickly</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {getRestaurantsByCategory("bookNow").map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    showBadge={true}
                    badgeText="Featured"
                    badgeColor="bg-red-500"
                  />
                ))}
              </div>
            </section>

            {/* All Restaurants Grid Section */}
            <section className="px-4 mt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">All Restaurants</h2>
                <p className="text-gray-600">
                  {getFilteredRestaurants().length} restaurants {selectedCuisine !== "All Restaurants" ? `serving ${selectedCuisine} cuisine` : "available"}
                </p>
              </div>
              
              {/* Restaurant Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredRestaurants().map((restaurant) => (
                  <RestaurantGridCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
              
              {/* Empty State for Filtered Results */}
              {getFilteredRestaurants().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
                  <p className="text-gray-600 mb-4">
                    No restaurants serving {selectedCuisine} cuisine were found.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCuisine("All Restaurants")}
                  >
                    Show all restaurants
                  </Button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
