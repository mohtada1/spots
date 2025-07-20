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
            <div className="flex flex-col md:flex-row gap-food-md items-end">
              {/* City Selector */}
              <div className="flex-1">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="rounded-food-small border-input">
                    <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="rounded-food-small">
                    <SelectItem value="karachi">Karachi</SelectItem>
                    <SelectItem value="lahore">Lahore</SelectItem>
                    <SelectItem value="islamabad">Islamabad</SelectItem>
                    <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="flex-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    type="text"
                    placeholder="Search restaurants, cuisine, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 rounded-food-small"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                className="px-food-xl py-food-md text-lg font-semibold bg-food-primary hover:bg-food-primary/90 text-white min-w-[120px] h-12"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
