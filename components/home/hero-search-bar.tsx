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
    <div className="bg-foreground text-background py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold font-poppins mb-4">Book Your Perfect Table</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          Discover and reserve tables at Pakistan's best restaurants in seconds
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* City Selector */}
              <div className="flex-1">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="rounded-xl border-input">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search restaurants, cuisine, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="booking-highlight rounded-xl px-8 py-3 text-lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
