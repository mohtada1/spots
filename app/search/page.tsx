"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { FilterSidebar } from "@/components/search/filter-sidebar"
import { RestaurantCardList } from "@/components/search/restaurant-card-list"
import { mockRestaurants } from "@/lib/mock-data"
import type { SearchFilters, Restaurant } from "@/lib/types"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [isLoading, setIsLoading] = useState(false)
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants)
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get("city") || "",
    cuisine: [],
    halal: null,
    priceLevel: [],
  })

  useEffect(() => {
    filterRestaurants()
  }, [filters, searchQuery])

  const filterRestaurants = () => {
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      let filtered = mockRestaurants

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
            restaurant.city.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Filter by city
      if (filters.city) {
        filtered = filtered.filter((restaurant) => restaurant.city.toLowerCase() === filters.city.toLowerCase())
      }

      // Filter by cuisine
      if (filters.cuisine.length > 0) {
        filtered = filtered.filter((restaurant) => restaurant.cuisine.some((c) => filters.cuisine.includes(c)))
      }

      // Filter by halal
      if (filters.halal === true) {
        filtered = filtered.filter((restaurant) => restaurant.halal)
      }

      // Filter by price level
      if (filters.priceLevel.length > 0) {
        filtered = filtered.filter((restaurant) => filters.priceLevel.includes(restaurant.priceLevel))
      }

      setFilteredRestaurants(filtered)
      setIsLoading(false)
    }, 500)
  }

  const handleSearch = () => {
    filterRestaurants()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-4">Find Your Perfect Restaurant</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search restaurants, cuisine, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button onClick={handleSearch} className="booking-highlight rounded-xl">
            Search
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="mb-4 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 rounded-r-xl">
              <SheetHeader>
                <SheetTitle>Filter Restaurants</SheetTitle>
                <SheetDescription>Narrow down your search results</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar filters={filters} onChange={setFilters} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `${filteredRestaurants.length} restaurants found`}
          </div>
          <RestaurantCardList restaurants={filteredRestaurants} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
