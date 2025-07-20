"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeroSearchBarProps {
  onSearch: (query: string) => void
}

export function HeroSearchBar({ onSearch }: HeroSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedCity) params.set("city", selectedCity)

    router.push(`/search?${params.toString()}`)
    onSearch(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div 
      className="relative min-h-[50vh] flex items-center justify-center text-white"
      style={{
        backgroundImage: 'url(https://l8z7egtqhmfautov.public.blob.vercel-storage.com/hero)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-food-md text-center">
        <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-food-lg text-white">
          Discover Amazing Food
        </h1>
        <p className="text-xl md:text-2xl mb-food-2xl text-white/90 max-w-2xl mx-auto">
          Find and book tables at the best restaurants in Pakistan
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-food-medium shadow-xl p-food-lg md:p-food-xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-4xl">
              {/* City Selector */}
              <div className="w-full sm:w-48">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-12 rounded-lg border-2 border-white/20 bg-white text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Select City" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="karachi">Karachi</SelectItem>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                    <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search restaurants, cuisine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 pl-10 rounded-lg border-2 border-white/20 bg-white text-gray-700 placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                className="h-12 px-6 sm:px-8 bg-food-primary hover:bg-food-primary/90 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
