"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageDeleted?: () => void
  restaurantId?: string
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
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onImageUploaded(result.url)
        toast({
          title: "Image uploaded successfully",
          description: "Your restaurant image has been uploaded.",
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleDelete = () => {
    if (onImageDeleted) {
      onImageDeleted()
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {currentImageUrl ? (
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={currentImageUrl}
                alt="Restaurant"
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-lg border"
              />
              {onImageDeleted && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Replace Image'}
            </Button>
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              disabled={isUploading}
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isUploading ? 'Uploading...' : 'Upload restaurant image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop or click to select (JPEG, PNG, WebP - Max 5MB)
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={isUploading}
                className="mt-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
