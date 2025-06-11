"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailabilityPickerProps {
  restaurantId: string
  onSelect: (slot: { date: string; time: string; partySize: number }) => void
}

export function AvailabilityPicker({ restaurantId, onSelect }: AvailabilityPickerProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [partySize, setPartySize] = useState("2")

  // Mock available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    }
  })

  // Mock available times
  const availableTimes = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]

  const handleReserve = () => {
    if (selectedDate && selectedTime) {
      onSelect({
        date: selectedDate,
        time: selectedTime,
        partySize: Number.parseInt(partySize),
      })
    }
  }

  const isReserveDisabled = !selectedDate || !selectedTime

  return (
    <Card className="sticky top-24 rounded-xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Make a Reservation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Party Size */}
        <div>
          <Label htmlFor="party-size" className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4" />
            <span>Party Size</span>
          </Label>
          <Select value={partySize} onValueChange={setPartySize}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} {size === 1 ? "person" : "people"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div>
          <Label htmlFor="date" className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4" />
            <span>Date</span>
          </Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableDates.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  {date.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Selection */}
        <div>
          <Label htmlFor="time" className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {availableTimes.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(time)}
                className={`rounded-xl ${selectedTime === time ? "booking-highlight" : ""}`}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleReserve} disabled={isReserveDisabled} className="booking-highlight rounded-xl w-full">
          Reserve Table
        </Button>

        <p className="text-xs text-muted-foreground text-center">You'll receive SMS confirmation within minutes</p>
      </CardContent>
    </Card>
  )
}
