export interface DayHours {
  day: string
  hours: string
  isToday?: boolean
}

export function parseOpeningHours(hoursString: string): DayHours[] {
  if (!hoursString) return []
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  
  // Split by day names and clean up
  const dayHours: DayHours[] = []
  
  // Handle the format: "Monday: 9:00 AM – 12:00 AM, Tuesday: 9:00 AM – 12:00 AM, ..."
  const dayPattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):\s*([^,]+)/g
  let match
  
  while ((match = dayPattern.exec(hoursString)) !== null) {
    const [, day, hours] = match
    dayHours.push({
      day,
      hours: hours.trim(),
      isToday: day === today
    })
  }
  
  return dayHours
}

export function getTodayHours(hoursString: string): string {
  const parsedHours = parseOpeningHours(hoursString)
  const todayHours = parsedHours.find(h => h.isToday)
  
  if (todayHours) {
    return `Today: ${todayHours.hours}`
  }
  
  // Fallback: try to extract first hours if parsing fails
  const firstHoursMatch = hoursString.match(/(\d{1,2}:\d{2}\s*[AP]M\s*[–-]\s*\d{1,2}:\d{2}\s*[AP]M)/)
  if (firstHoursMatch) {
    return `Today: ${firstHoursMatch[1]}`
  }
  
  return 'Hours not available'
}

export function formatHoursForDisplay(hoursString: string): DayHours[] {
  const parsedHours = parseOpeningHours(hoursString)
  
  // If parsing worked, return it
  if (parsedHours.length > 0) {
    return parsedHours
  }
  
  // Fallback: assume same hours for all days
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  
  const firstHoursMatch = hoursString.match(/(\d{1,2}:\d{2}\s*[AP]M\s*[–-]\s*\d{1,2}:\d{2}\s*[AP]M)/)
  const hours = firstHoursMatch ? firstHoursMatch[1] : hoursString
  
  return days.map(day => ({
    day,
    hours,
    isToday: day === today
  }))
}
