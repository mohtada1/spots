"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

interface RestaurantMapProps {
  location: string
  restaurantName: string
  className?: string
}

function convertToEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // If it's already an embed URL, return as is
    if (url.includes('/maps/embed')) {
      return url
    }
    
    // Extract coordinates from place URLs
    const pathMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (pathMatch) {
      const [, lat, lng] = pathMatch
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1000000000000!5m2!1sen!2s`
    }
    
    // Fallback: try to extract place ID or use search
    const placeMatch = url.match(/place\/([^\/]+)/)
    if (placeMatch) {
      const placeName = encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
      return `https://www.google.com/maps/embed/v1/place?key=&q=${placeName}`
    }
    
    return url
  } catch {
    return url
  }
}

export function RestaurantMap({ location, restaurantName, className = "" }: RestaurantMapProps) {
  const [mapError, setMapError] = useState(false)
  
  if (!location || mapError) {
    return null
  }
  
  const embedUrl = convertToEmbedUrl(location)
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <MapPin className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold text-food-text">Location</h3>
      </div>
      
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${restaurantName} location map`}
          onError={() => setMapError(true)}
          className="rounded-xl"
        />
      </div>
      
      <div className="text-sm text-gray-600 flex justify-between items-center">
        <a 
          href={location}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-500 hover:text-red-600 transition-colors duration-200 font-medium inline-flex items-center space-x-1"
        >
          <span>View on Google Maps</span>
          <span>→</span>
        </a>
        <span className="text-xs text-gray-400">
          Get directions
        </span>
      </div>
    </div>
  )
}
