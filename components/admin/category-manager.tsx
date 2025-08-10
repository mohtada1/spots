"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit2, Trash2, Save, X, GripVertical, Users } from "lucide-react"
import type { Category, Restaurant } from "@/lib/types"

interface CategoryFormData {
  title: string
  description: string
  display_order: number
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [categoryRestaurants, setCategoryRestaurants] = useState<Record<string, Restaurant[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [managingRestaurants, setManagingRestaurants] = useState<string | null>(null)
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([])
  const [formData, setFormData] = useState<CategoryFormData>({
    title: "",
    description: "",
    display_order: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load categories
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)

      // Load all restaurants
      const restaurantsResponse = await fetch('/api/restaurants')
      const restaurantsResult = await restaurantsResponse.json()
      
      console.log('Restaurants API response:', restaurantsResult)
      
      // Handle different API response formats
      const restaurantsData = restaurantsResult.success ? restaurantsResult.data : restaurantsResult
      console.log('Processed restaurants data:', restaurantsData)
      
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : [])

      // Load restaurants for each category
      const categoryRestaurantsData: Record<string, Restaurant[]> = {}
      for (const category of categoriesData) {
        const restaurantsResponse = await fetch(`/api/categories/${category.id}/restaurants`)
        const restaurantsData = await restaurantsResponse.json()
        categoryRestaurantsData[category.id] = restaurantsData
      }
      setCategoryRestaurants(categoryRestaurantsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load categories and restaurants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully",
        })
        setShowCreateForm(false)
        setFormData({ title: "", description: "", display_order: 0 })
        loadData()
      } else {
        throw new Error('Failed to create category')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        setEditingCategory(null)
        loadData()
      } else {
        throw new Error('Failed to update category')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        loadData()
      } else {
        throw new Error('Failed to delete category')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category.id)
    setFormData({
      title: category.title,
      description: category.description || "",
      display_order: category.display_order
    })
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setShowCreateForm(false)
    setManagingRestaurants(null)
    setSelectedRestaurants([])
    setFormData({ title: "", description: "", display_order: 0 })
  }

  const startManageRestaurants = (categoryId: string) => {
    setManagingRestaurants(categoryId)
    // Pre-select restaurants already in this category
    const currentRestaurants = categoryRestaurants[categoryId] || []
    setSelectedRestaurants(currentRestaurants.map(r => r.id))
  }

  const handleRestaurantToggle = (restaurantId: string, checked: boolean) => {
    if (checked) {
      setSelectedRestaurants(prev => [...prev, restaurantId])
    } else {
      setSelectedRestaurants(prev => prev.filter(id => id !== restaurantId))
    }
  }

  const saveRestaurantAssignments = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_ids: selectedRestaurants })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Restaurant assignments updated successfully",
        })
        setManagingRestaurants(null)
        setSelectedRestaurants([])
        loadData() // Refresh data
      } else {
        throw new Error('Failed to update assignments')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update restaurant assignments",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading categories...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-red-500 hover:bg-red-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Category title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Category description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Display order"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateCategory} className="bg-green-500 hover:bg-green-600">
                <Save className="h-4 w-4 mr-2" />
                Create
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              {editingCategory === category.id ? (
                <div className="space-y-4">
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateCategory(category.id)} className="bg-green-500 hover:bg-green-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : managingRestaurants === category.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Assign Restaurants to "{category.title}"</h3>
                    <div className="flex gap-2">
                      <Button onClick={() => saveRestaurantAssignments(category.id)} className="bg-green-500 hover:bg-green-600">
                        <Save className="h-4 w-4 mr-2" />
                        Save ({selectedRestaurants.length})
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {Array.isArray(restaurants) && restaurants.length > 0 ? restaurants.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={restaurant.id}
                          checked={selectedRestaurants.includes(restaurant.id)}
                          onCheckedChange={(checked) => handleRestaurantToggle(restaurant.id, checked as boolean)}
                        />
                        <label htmlFor={restaurant.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-500">
                            {restaurant.cuisine?.join(', ')} • {restaurant.city} • {restaurant.price_level}
                          </div>
                        </label>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        No restaurants available
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <h3 className="text-lg font-semibold">{category.title}</h3>
                      <Badge variant="outline">Order: {category.display_order}</Badge>
                      <Badge variant="secondary">{categoryRestaurants[category.id]?.length || 0} restaurants</Badge>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 mb-2">{category.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mb-2">
                      Created: {new Date(category.created_at || '').toLocaleDateString()}
                    </div>
                    {categoryRestaurants[category.id]?.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Restaurants:</strong> {categoryRestaurants[category.id].slice(0, 3).map(r => r.name).join(', ')}
                        {categoryRestaurants[category.id].length > 3 && ` +${categoryRestaurants[category.id].length - 3} more`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startManageRestaurants(category.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No categories found. Create your first category to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
