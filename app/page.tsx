"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, Filter, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getRestaurantUrl } from "@/lib/utils/urls"
import { getTodayHours } from "@/lib/utils/hours"
import type { Restaurant, SearchFilters } from "@/lib/types"
import { api } from "@/lib/api"

// Utility function to format ISO datetime to readable time
const formatTimeSlot = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } catch {
    return isoString // fallback to original if parsing fails
  }
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("All Restaurants")
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
    if (searchQuery.trim()) {
      // Navigate to search page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Navigate to restaurant detail page
  const handleRestaurantClick = (restaurant: Restaurant) => {
    const url = getRestaurantUrl(restaurant)
    router.push(url)
  }

  // Filter restaurants by category
  const getRestaurantsByCategory = (category: string) => {
    switch (category) {
      case "featured":
        // Get top-rated restaurants as "featured"
        return restaurants.filter(r => r.rating && r.rating >= 4.5).slice(0, 4)
      case "nearby":
        // Get restaurants in the same city as "nearby"
        return restaurants.slice(0, 4)
      case "topRated":
        return restaurants.filter(r => r.rating && r.rating >= 4.7).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4)
      case "bookNow":
        // Get restaurants that are open now
        return restaurants.slice(0, 4)
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
      onClick={() => handleRestaurantClick(restaurant)}
    >
      <CardContent className="p-0">
        {/* Restaurant Image */}
        <div className="relative h-32 bg-gray-200">
          {restaurant.images?.find(img => img.is_primary)?.blob_url || restaurant.images?.[0]?.blob_url ? (
            <img 
              src={restaurant.images?.find(img => img.is_primary)?.blob_url || restaurant.images?.[0]?.blob_url} 
              alt={restaurant.images?.find(img => img.is_primary)?.alt_text || restaurant.images?.[0]?.alt_text || restaurant.name}
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
          
          {/* Fallback placeholder - shown when no images or on error */}
          <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${restaurant.images?.find(img => img.is_primary)?.blob_url || restaurant.images?.[0]?.blob_url ? 'hidden' : ''}`}>
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
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{restaurant.rating || 'N/A'}</span>
            </div>
          </div>

          {/* Cuisine and Price */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-600">
              {typeof restaurant.cuisine === 'string' 
                ? restaurant.cuisine 
                : (restaurant.cuisine as string[] | undefined)?.join(", ") || ''}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-xs font-medium text-gray-700">
              {restaurant.price_level || '$$'}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {restaurant.city || 'Karachi'}
            </span>
          </div>

          {/* Opening Hours */}
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {restaurant.opening_hours ? getTodayHours(restaurant.opening_hours) : "Hours not available"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Restaurant card component for grid layout
  const RestaurantGridCard = ({ restaurant }: { restaurant: Restaurant }) => {
    // Only show Featured badge for highly-rated restaurants
    const showFeaturedBadge = restaurant.rating >= 4.5

    return (
      <Card 
        className="shadow-sm hover:shadow-md transition-shadow duration-200 border-0 bg-white rounded-xl overflow-hidden cursor-pointer"
        onClick={() => handleRestaurantClick(restaurant)}
      >
        <CardContent className="p-0">
          {/* Restaurant Image */}
          <div className="relative h-48 bg-gray-200">
            {restaurant.images?.find(img => img.is_primary)?.blob_url || restaurant.images?.[0]?.blob_url ? (
              <img 
                src={restaurant.images?.find(img => img.is_primary)?.blob_url || restaurant.images?.[0]?.blob_url} 
                alt={restaurant.images?.find(img => img.is_primary)?.alt_text || restaurant.images?.[0]?.alt_text || restaurant.name}
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
            
            {/* Fallback placeholder - shown when no images or on error */}
            <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${restaurant.images?.[0]?.blob_url ? 'hidden' : ''}`}>
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
            
            {/* Featured Badge */}
            {showFeaturedBadge && (
              <div className="absolute top-3 left-3">
                <Badge className="text-xs font-medium text-white bg-red-500 hover:bg-red-500">
                  Featured
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
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating || 'N/A'}</span>
              </div>
            </div>

            {/* Cuisine and Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">
                {typeof restaurant.cuisine === 'string' 
                ? restaurant.cuisine 
                : (restaurant.cuisine as string[] | undefined)?.join(", ") || ''}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm font-medium text-gray-700">
                {restaurant.price_level || '$$'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {restaurant.city || 'Karachi'}
              </span>
            </div>

            {/* Availability Times */}
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs px-2 py-1">
                Reserve Now
              </Badge>
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
    return restaurants.filter(restaurant => {
      const cuisines = typeof restaurant.cuisine === 'string' 
        ? [restaurant.cuisine]
        : restaurant.cuisine || [];
      
      return cuisines.some(cuisine => 
        cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())
      )
    })
  }

  // Cuisine filter pills
  const cuisineFilters = ["All Restaurants", "Italian", "Japanese", "French", "American", "Mexican", "Seafood", "Mediterranean", "Chinese", "Korean", "Indian"]

  return (
    <>
      {/* Hide scrollbars for horizontal scrolling */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
    <div className="min-h-screen bg-white -mt-16">
      {/* Hero Section with Background Image - Extends behind header */}
      <div className="relative h-[100vh] bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Hero Content - Add top padding to account for header */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-4 text-center pt-20">
          <div className="mt-8 mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Find Your Perfect Table</h2>
            <p className="text-base sm:text-lg opacity-90 mb-6">Discover and book the best restaurants in your city</p>
          </div>
          
          {/* Search Form - Simplified */}
          <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-12 text-base text-gray-900 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder:text-gray-500"
                  placeholder="Search restaurants, cuisines, or dishes..."
                />
                <Button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 px-6 bg-red-500 hover:bg-red-600 text-white font-medium rounded-r-xl transition-colors duration-200"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-4 py-6 bg-white">
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
      <div className="px-4 py-4 border-b border-gray-100 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
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
            <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold text-gray-900">Featured</h2>
                  <span className="text-sm text-gray-600">Handpicked by our experts</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
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
              </div>
            </section>

            {/* Nearby & Available Section */}
            <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold text-gray-900">Nearby & Available</h2>
                  <span className="text-sm text-gray-600">Close to you with open tables</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
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
              </div>
            </section>

            {/* Top Rated Section */}
            <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold text-gray-900">Top Rated</h2>
                  <span className="text-sm text-gray-600">Highest rated restaurants</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {getRestaurantsByCategory("topRated").map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            </section>

            {/* Book Now Section */}
            <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h2 className="text-xl font-bold text-gray-900">Book Now</h2>
                  <span className="text-sm text-gray-600">Limited availability - reserve quickly</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
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
              </div>
            </section>

            {/* All Restaurants Grid Section */}
            <section className="mt-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">All Restaurants</h2>
                  <p className="text-gray-600">
                    {getFilteredRestaurants().length} restaurants {selectedCuisine !== "All Restaurants" ? `serving ${selectedCuisine} cuisine` : "available"}
                  </p>
                </div>
                
                {/* Restaurant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
