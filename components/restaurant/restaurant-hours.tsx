"use client"

import { Clock } from "lucide-react"
import { formatHoursForDisplay } from "@/lib/utils/hours"

interface RestaurantHoursProps {
  hoursString: string
  className?: string
}

export function RestaurantHours({ hoursString, className = "" }: RestaurantHoursProps) {
  const hours = formatHoursForDisplay(hoursString)
  
  if (hours.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-food-text">Hours</h3>
        </div>
        <p className="text-gray-600">Hours not available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-food-text">Hours</h3>
      </div>
      
      <div className="space-y-2">
        {hours.map((dayHour) => (
          <div 
            key={dayHour.day}
            className="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">
              {dayHour.day}
              {dayHour.isToday && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </span>
            <span className="text-sm text-gray-600">
              {dayHour.hours}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
