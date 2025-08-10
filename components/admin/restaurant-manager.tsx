"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RestaurantImageManager } from "@/components/admin/restaurant-image-manager"
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Images } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Restaurant } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface RestaurantManagerProps {
  restaurants: Restaurant[]
  onRestaurantUpdated: (restaurant: Restaurant) => Promise<void>
  onRestaurantDeleted: (id: string) => Promise<void>
  onRestaurantCreated: (restaurant: Omit<Restaurant, "id" | "created_at" | "updated_at">) => Promise<void>
}

export function RestaurantManager({
  restaurants,
  onRestaurantUpdated,
  onRestaurantDeleted,
  onRestaurantCreated,
}: RestaurantManagerProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Restaurant>>({})
  const { toast } = useToast()

  const cuisineOptions = ["Pakistani", "BBQ", "Continental", "Italian", "Chinese", "Fast Food", "Desserts", "Asian"]
  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"]
  const priceLevels = ["$", "$$", "$$$", "$$$$"]

  const toggleCard = (restaurantId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(restaurantId)) {
      newExpanded.delete(restaurantId)
      setFormData({}) // Clear form data when collapsing
    } else {
      newExpanded.add(restaurantId)
      const restaurant = restaurants.find(r => r.id === restaurantId)
      if (restaurant) {
        setFormData(restaurant) // Load restaurant data when expanding
      }
    }
    setExpandedCards(newExpanded)
  }

  const startCreate = () => {
    setIsCreating(true)
    setFormData({
      name: "",
      city: "",
      cuisine: [],
      price_level: "$$",
      rating: 4.0,
      description: "",
      address: "",
      phone: "",
      website: "",
      opening_hours: "",
    })
  }

  const cancelCreate = () => {
    setIsCreating(false)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.city || !formData.cuisine?.length) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Validate Google Maps URL if provided
      if (formData.location && formData.location.trim()) {
        try {
          const url = new URL(formData.location)
          if (!url.hostname.includes('google.com') || !formData.location.includes('maps')) {
            toast({
              title: "Invalid Location URL",
              description: "Please provide a valid Google Maps link",
              variant: "destructive",
            })
            return
          }
        } catch {
          toast({
            title: "Invalid Location URL",
            description: "Please provide a valid Google Maps link",
            variant: "destructive",
          })
          return
        }
      }

      if (isCreating) {
        // Create new restaurant via API
        const newRestaurantData = {
          name: formData.name!,
          cuisine: formData.cuisine!,
          rating: formData.rating || 0,
          city: formData.city || formData.address || "Karachi",
          price_level: formData.price_level || "$$",
          description: formData.description || null,
          opening_hours: formData.opening_hours || null,
          phone: formData.phone || null,
          address: formData.address || null,
          location: formData.location || null,
          website: formData.website || null,
        }
        await onRestaurantCreated(newRestaurantData)
        setIsCreating(false)
      } else {
        // Update existing restaurant
        await onRestaurantUpdated(formData as Restaurant)
        // Keep the card expanded after saving
      }

      setFormData({})
      toast({
        title: "Success",
        description: isCreating ? "Restaurant created successfully" : "Restaurant updated successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save restaurant",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await onRestaurantDeleted(id)
        toast({
          title: "Restaurant deleted",
          description: "The restaurant has been removed",
          variant: "success",
        })
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Error",
          description: "Failed to delete restaurant",
          variant: "destructive",
        })
      }
    }
  }

  const handleCuisineToggle = (cuisine: string, checked: boolean) => {
    const currentCuisines = formData.cuisine || []
    const newCuisines = checked ? [...currentCuisines, cuisine] : currentCuisines.filter((c) => c !== cuisine)

    setFormData({ ...formData, cuisine: newCuisines })
  }



  return (
    <div className="space-y-food-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-food-text">Restaurant Management</h2>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="rounded-food-small border-0 shadow-sm bg-food-background">
          <CardHeader>
            <CardTitle className="text-food-text">Create New Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-food-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city || ""}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Cuisine Types *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {cuisineOptions.map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine}
                      checked={formData.cuisine?.includes(cuisine) || false}
                      onCheckedChange={(checked) => handleCuisineToggle(cuisine, checked as boolean)}
                    />
                    <Label htmlFor={cuisine} className="text-sm">
                      {cuisine}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price_level">Price Level</Label>
                <Select
                  value={formData.price_level || ""}
                  onValueChange={(value) => setFormData({ ...formData, price_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || ""}
                  onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              {/* Halal field removed - all restaurants are halal by default */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="opening_hours">Opening Hours</Label>
              <Input
                id="opening_hours"
                placeholder="e.g., 12:00 PM - 11:00 PM"
                value={formData.opening_hours || ""}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Google Maps Location</Label>
              <Input
                id="location"
                placeholder="Paste Google Maps link here"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy and paste a Google Maps link (e.g., from sharing a location)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Image management is now handled separately via the new image system */}

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Create Restaurant
              </Button>
              <Button onClick={cancelCreate} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant List */}
      <div className="grid grid-cols-1 gap-6">
        {restaurants.map((restaurant) => (
          <Card 
            key={restaurant.id} 
            className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white rounded-lg"
          >
            {expandedCards.has(restaurant.id) ? (
              // Edit Form
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select
                      value={formData.city || ""}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Cuisine Types *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {cuisineOptions.map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={cuisine}
                          checked={formData.cuisine?.includes(cuisine) || false}
                          onCheckedChange={(checked) => handleCuisineToggle(cuisine, checked as boolean)}
                        />
                        <Label htmlFor={cuisine} className="text-sm">
                          {cuisine}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_level">Price Level *</Label>
                    <Select
                      value={formData.price_level || ""}
                      onValueChange={(value) => setFormData({ ...formData, price_level: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || ""}
                      onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) || 0 })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="opening_hours">Opening Hours</Label>
                  <Input
                    id="opening_hours"
                    placeholder="e.g., 12:00 PM - 11:00 PM"
                    value={formData.opening_hours || ""}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Google Maps Location</Label>
                  <Input
                    id="location"
                    placeholder="Paste Google Maps link here"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Copy and paste a Google Maps link (e.g., from sharing a location)
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://restaurant-website.com"
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSave} className="booking-highlight rounded-xl">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCard(restaurant.id)
                    }} 
                    variant="outline" 
                    className="rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>

                {/* Image Management Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Images className="h-5 w-5" />
                    Image Management
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <RestaurantImageManager 
                      restaurantId={restaurant.id}
                      onImagesUpdated={() => {
                        console.log('Images updated for restaurant:', restaurant.id)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            ) : (
              // Collapsed Display Mode
              <CardContent className="p-6">
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleCard(restaurant.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {restaurant.cuisine.map((cuisine) => (
                        <Badge key={cuisine} variant="outline">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {restaurant.city} • {restaurant.price_level} • ⭐ {restaurant.rating}
                    </p>
                    {restaurant.description && (
                      <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
                    )}
                    {restaurant.address && <p className="text-sm text-muted-foreground">{restaurant.address}</p>}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(restaurant.id)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                

              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
