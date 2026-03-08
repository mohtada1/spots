# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Spots is a restaurant reservation system built with Next.js 14 and Supabase. The project consists of two applications:
- **Main app** (`/`): Customer-facing restaurant discovery and reservation platform
- **Admin app** (`/spots-admin/`): Standalone admin dashboard for managing restaurants and reservations

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: TailwindCSS + shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (PostgreSQL database + Auth)
- **File Storage**: Vercel Blob (for image uploads)
- **Deployment**: Vercel

### Database Schema
Three main tables with RLS enabled:
- `restaurants`: Restaurant listings with cuisine, price level, ratings
- `reservations`: Customer bookings with confirmation codes
- `admin_users`: Admin access control

### Key Patterns
- **Slug-based routing**: URLs use format `/restaurants/{name}-{id}` for SEO
- **API Routes**: All database operations go through `/api/*` endpoints
- **Dual Supabase clients**: Public client for general ops, admin client with service role for privileged operations
- **Path aliases**: `@/*` maps to project root

## Development Commands

### Main Application
```bash
npm run dev           # Start development server (port 3000)
npm run build         # Build for production
npm run lint          # Run ESLint
npm run import-restaurants  # Bulk import restaurants from CSV
```

### Admin Application
```bash
cd spots-admin
npm run dev           # Start admin panel (separate port)
npm run build         # Build admin panel
```

### Testing Individual Components
```bash
# No test runner configured - use dev server for manual testing
npm run dev
# Navigate to specific routes to test features
```

## Environment Setup

Create `.env.local` in both root and `/spots-admin/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]  # Server-only
BLOB_READ_WRITE_TOKEN=[vercel_blob_token]      # For image uploads
```

## Key API Endpoints

### Public APIs
- `GET /api/restaurants` - List restaurants with filters
- `GET /api/restaurants/[slug-id]` - Get single restaurant
- `POST /api/reservations` - Create reservation
- `GET /api/categories` - List categories
- `POST /api/upload` - Upload images to Vercel Blob

### Admin APIs (require auth token)
- `POST /api/admin/login` - Admin authentication
- All `/api/admin/*` routes require `Authorization: Bearer [token]` header

## Data Import

Use the bulk import script for CSV data:
1. Place `restaurants.csv` in `/scripts/` with columns: Area, Name, Address, Rating, Total Reviews, Phone Number, Website, Price Level, Google Maps URL, Opening Hours
2. Run: `npm run import-restaurants`
3. Script auto-assigns cuisines based on restaurant names and generates SEO slugs

## URL Routing & Middleware

The middleware (`/middleware.ts`) handles URL redirections:
- Old format `/restaurant/[id]` → New format `/restaurants/[slug-id]`
- Old format `/reserve/[id]` → New format `/reserve/[slug-id]`

## Supabase Integration

### Database Type Generation
Regenerate TypeScript types when schema changes:
```bash
npx supabase gen types typescript --project-id tvnodvcytjdwbhdhgbex --schema public > lib/database.types.ts
```

### RLS Policies
All tables have Row Level Security enabled. Performance tip: Replace `auth.<fn>()` with `(select auth.<fn>())` in policies.

## Build Configuration

### TypeScript & ESLint
- **Strict mode**: Enabled
- **Build errors**: Ignored in production (`ignoreBuildErrors: true`)
- **Linting during build**: Disabled (`ignoreDuringBuilds: true`)

### Image Optimization
Disabled (`unoptimized: true`) for Vercel deployment compatibility

## Project Structure Highlights

- `/app/` - Next.js App Router pages and API routes
- `/components/` - Organized by feature (home, restaurant, reservation, admin, ui)
- `/lib/` - Core utilities, Supabase client, types, API helpers
- `/lib/utils/slug.ts` - SEO slug generation and parsing
- `/scripts/` - Data import utilities
- `/spots-admin/` - Separate admin application

## Common Development Tasks

### Adding a New Restaurant Field
1. Update Supabase schema via dashboard
2. Regenerate types: `npx supabase gen types typescript...`
3. Update `/lib/types.ts` interfaces
4. Modify API routes in `/app/api/restaurants/`
5. Update UI components in `/components/restaurant/`

### Implementing New Search Filters
1. Add filter to `SearchFilters` type in `/lib/types.ts`
2. Update `/app/api/restaurants/route.ts` query logic
3. Modify search UI in `/components/search/`
4. Update `/lib/api.ts` client methods

### Managing Reservations
- Confirmation codes are auto-generated 8-character strings
- Status workflow: pending → confirmed/cancelled
- Admin operations require authentication through `/spots-admin/`

## Performance Considerations

- Unused database indexes on: reservations (confirmation_code, date, restaurant_id), restaurants (city)
- Multiple RLS policies can be consolidated for better performance
- Consider pagination for restaurant listings as data grows

## Security Notes

- Service role key is server-only - never expose client-side
- Admin routes verify auth via `supabaseAdmin.auth.getUser(token)`
- All user inputs are validated before database operations
