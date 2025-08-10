"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Upload, Star, StarOff, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/lib/admin-auth-context"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface RestaurantImage {
  id: string
  blob_url: string
  alt_text: string | null
  display_order: number | null
  is_primary: boolean | null
}

interface RestaurantImageManagerProps {
  restaurantId: string
  onImagesUpdated?: () => void
}

export function RestaurantImageManager({ restaurantId, onImagesUpdated }: RestaurantImageManagerProps) {
  const [images, setImages] = useState<RestaurantImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { session } = useAdminAuth()

  // Fetch images
  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/images`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [restaurantId])

  // Upload new image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "Not authenticated. Please log in again.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    const token = session.access_token

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/admin/restaurants/${restaurantId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }
      }

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
        variant: "success"
      })

      await fetchImages()
      onImagesUpdated?.()
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Set primary image
  const setPrimaryImage = async (imageId: string) => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "Not authenticated. Please log in again.",
        variant: "destructive"
      })
      return
    }
    
    const token = session.access_token
    
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageId,
          updates: { is_primary: true }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to set primary image')
      }

      toast({
        title: "Success",
        description: "Primary image updated",
        variant: "success"
      })

      await fetchImages()
      onImagesUpdated?.()
    } catch (error) {
      console.error('Error setting primary image:', error)
      toast({
        title: "Error",
        description: "Failed to set primary image",
        variant: "destructive"
      })
    }
  }

  // Delete image
  const deleteImage = async (imageId: string) => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "Not authenticated. Please log in again.",
        variant: "destructive"
      })
      return
    }
    
    const token = session.access_token
    
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/images?imageId=${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      toast({
        title: "Success",
        description: "Image deleted successfully",
        variant: "success"
      })

      await fetchImages()
      onImagesUpdated?.()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Images ({images.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div>
          <Label htmlFor="image-upload">Upload New Images</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading}
            className="mt-2"
          />
          {isUploading && (
            <p className="text-sm text-muted-foreground mt-2">
              Uploading images...
            </p>
          )}
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .sort((a, b) => {
                if (a.is_primary) return -1
                if (b.is_primary) return 1
                return (a.display_order || 0) - (b.display_order || 0)
              })
              .map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative group border-2 rounded-lg overflow-hidden",
                    image.is_primary ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                  )}
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <Image
                      src={image.blob_url}
                      alt={image.alt_text || "Restaurant image"}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryImage(image.id)}
                        disabled={image.is_primary}
                      >
                        {image.is_primary ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Upload some images to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
