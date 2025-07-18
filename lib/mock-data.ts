import type { Restaurant, Reservation } from "./types"

// Note: These will be replaced by actual database UUIDs
// This is just for fallback/development purposes
export const mockRestaurants: Restaurant[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Kolachi Seaview",
    city: "Karachi",
    cuisine: ["Pakistani", "BBQ"],
    halal: true,
    price_level: "₨₨",
    rating: 4.5,
    image_url: "/placeholder.svg?height=300&width=400",
    available_slots: ["2025-01-15T19:00", "2025-01-15T21:00", "2025-01-16T18:30"],
    description: "Authentic Pakistani cuisine with stunning sea views",
    address: "Do Darya, Phase 8, DHA, Karachi",
    phone: "+92-21-35840001",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Cafe Flo",
    city: "Lahore",
    cuisine: ["Continental", "Italian"],
    halal: true,
    price_level: "₨₨₨",
    rating: 4.3,
    image_url: "/placeholder.svg?height=300&width=400",
    available_slots: ["2025-01-15T20:00", "2025-01-16T19:30"],
    description: "Fine dining with European flavors",
    address: "MM Alam Road, Gulberg III, Lahore",
    phone: "+92-42-35756677",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "The Burning Brownie",
    city: "Islamabad",
    cuisine: ["Desserts", "Continental"],
    halal: true,
    price_level: "₨₨",
    rating: 4.7,
    image_url: "/placeholder.svg?height=300&width=400",
    available_slots: ["2025-01-15T18:00", "2025-01-15T20:30"],
    description: "Famous for desserts and cozy ambiance",
    address: "F-7 Markaz, Islamabad",
    phone: "+92-51-2651234",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Okra",
    city: "Karachi",
    cuisine: ["Pakistani", "Asian"],
    halal: true,
    price_level: "₨₨₨",
    rating: 4.4,
    image_url: "/placeholder.svg?height=300&width=400",
    available_slots: ["2025-01-15T19:30", "2025-01-16T20:00"],
    description: "Contemporary Pakistani cuisine",
    address: "Clifton Block 4, Karachi",
    phone: "+92-21-35872345",
  },
]

export const mockReservations: Reservation[] = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    restaurant_id: "550e8400-e29b-41d4-a716-446655440001",
    party_size: 4,
    reservation_date: "2025-01-20",
    reservation_time: "19:00",
    status: "confirmed",
    customer_name: "Ali Ahmed",
    customer_phone: "+92-300-1234567",
    special_requests: "Window seat preferred",
    confirmation_code: "ABC123XY",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    restaurant_id: "550e8400-e29b-41d4-a716-446655440002",
    party_size: 2,
    reservation_date: "2025-01-22",
    reservation_time: "20:00",
    status: "pending",
    customer_name: "Sara Khan",
    customer_phone: "+92-300-7654321",
    confirmation_code: "DEF456ZW",
  },
]
