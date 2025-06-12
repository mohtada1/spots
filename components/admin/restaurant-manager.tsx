"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "./image-upload"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Restaurant } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface RestaurantManagerProps {
  restaurants: Restaurant[]
  onRestaurantUpdated: (restaurant: Restaurant) => void
  onRestaurantDeleted: (id: string) => void
  onRestaurantCreated: (restaurant: Restaurant) => void
}

export function RestaurantManager({
  restaurants,
  onRestaurantUpdated,
  onRestaurantDeleted,
  onRestaurantCreated,
}: RestaurantManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Restaurant>>({})
  const { toast } = useToast()

  const cuisineOptions = ["Pakistani", "BBQ", "Continental", "Italian", "Chinese", "Fast Food", "Desserts", "Asian"]
  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"]
  const priceLevels = ["₨", "₨₨", "₨₨₨", "₨₨₨₨"]

  const startEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant.id)
    setFormData(restaurant)
  }

  const startCreate = () => {
    setIsCreating(true)
    setFormData({
      name: "",
      city: "",
      cuisine: [],
      halal: true,
      price_level: "₨₨",
      rating: 0,
      description: "",
      address: "",
      phone: "",
      available_slots: [],
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
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

      if (isCreating) {
        // Create new restaurant
        const newRestaurant: Restaurant = {
          id: `restaurant-${Date.now()}`,
          name: formData.name!,
          city: formData.city!,
          cuisine: formData.cuisine!,
          halal: formData.halal || false,
          price_level: formData.price_level || "₨₨",
          rating: formData.rating || 0,
          image_url: formData.image_url || null,
          description: formData.description || null,
          address: formData.address || null,
          phone: formData.phone || null,
          available_slots: formData.available_slots || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        onRestaurantCreated(newRestaurant)
        setIsCreating(false)
      } else {
        // Update existing restaurant
        const updatedRestaurant: Restaurant = {
          ...(formData as Restaurant),
          updated_at: new Date().toISOString(),
        }
        onRestaurantUpdated(updatedRestaurant)
        setEditingId(null)
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
        onRestaurantDeleted(id)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Management</h2>
        <Button onClick={startCreate} className="booking-highlight rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle>Create New Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="halal"
                  checked={formData.halal || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, halal: checked as boolean })}
                />
                <Label htmlFor="halal">Halal Certified</Label>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div>
              <Label>Restaurant Image</Label>
              <ImageUpload
                currentImageUrl={formData.image_url}
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                onImageDeleted={() => setFormData({ ...formData, image_url: null })}
                restaurantId={formData.id || "new"}
                className="mt-2"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave} className="booking-highlight rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Create Restaurant
              </Button>
              <Button onClick={cancelEdit} variant="outline" className="rounded-xl">
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
          <Card key={restaurant.id} className="rounded-xl border-0 shadow-md">
            {editingId === restaurant.id ? (
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

                <div>
                  <Label>Restaurant Image</Label>
                  <ImageUpload
                    currentImageUrl={formData.image_url}
                    onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                    onImageDeleted={() => setFormData({ ...formData, image_url: null })}
                    restaurantId={restaurant.id}
                    className="mt-2"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSave} className="booking-highlight rounded-xl">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" className="rounded-xl">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              // Display Mode
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {restaurant.cuisine.map((cuisine) => (
                        <Badge key={cuisine} variant="outline">
                          {cuisine}
                        </Badge>
                      ))}
                      {restaurant.halal && <Badge className="bg-green-500 text-white">Halal</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {restaurant.city} • {restaurant.price_level} • ⭐ {restaurant.rating}
                    </p>
                    {restaurant.description && (
                      <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
                    )}
                    {restaurant.address && <p className="text-sm text-muted-foreground">{restaurant.address}</p>}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button onClick={() => startEdit(restaurant)} variant="outline" size="sm" className="rounded-xl">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(restaurant.id)}
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
