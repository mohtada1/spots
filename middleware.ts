import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old restaurant URLs to new slug-id format
  if (pathname.startsWith('/restaurant/')) {
    const id = pathname.split('/restaurant/')[1]
    if (id && !id.includes('-')) {
      // This is an old-style ID, redirect to new format
      // For now, redirect to a temporary URL that will need the restaurant name
      // In production, you'd fetch the restaurant name from the database
      return NextResponse.redirect(new URL(`/restaurants/restaurant-${id}`, request.url))
    }
  }

  // Redirect old reserve URLs
  if (pathname.startsWith('/reserve/') && !pathname.includes('-')) {
    const id = pathname.split('/reserve/')[1]
    if (id && !id.includes('-')) {
      return NextResponse.redirect(new URL(`/reserve/restaurant-${id}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/restaurant/:path*', '/reserve/:path*']
}
