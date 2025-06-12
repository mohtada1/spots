"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blobStorage } from "@/lib/blob-storage"
import Image from "next/image"

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageDeleted?: () => void
  restaurantId: string
  type?: "restaurant" | "menu"
  className?: string
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  restaurantId,
  type = "restaurant",
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Upload to blob storage
      const imageUrl =
        type === "menu"
          ? await blobStorage.uploadMenuImage(file, restaurantId)
          : await blobStorage.uploadRestaurantImage(file, restaurantId)

      // Clean up preview
      URL.revokeObjectURL(preview)

      setPreviewUrl(imageUrl)
      onImageUploaded(imageUrl)

      toast({
        title: "Image uploaded successfully",
        description: "The image has been saved",
        variant: "success",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!previewUrl) return

    try {
      await blobStorage.deleteRestaurantImage(previewUrl)
      setPreviewUrl(null)
      onImageDeleted?.()

      toast({
        title: "Image deleted",
        description: "The image has been removed",
        variant: "success",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className={`rounded-xl border-2 border-dashed ${className}`}>
      <CardContent className="p-6">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {previewUrl ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            </div>
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace Image
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Image</h3>
            <p className="text-muted-foreground text-sm mb-4">Select an image file (JPEG, PNG, WebP) up to 5MB</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="booking-highlight rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Choose Image"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
