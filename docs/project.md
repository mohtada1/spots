# Spots — Project Structure & Config Reference

A concise, code-first reference for prompts and onboarding.

## Stack
- Next.js 14 (App Router), TypeScript, React 18
- TailwindCSS + shadcn/ui (Radix primitives), lucide-react icons
- Supabase (auth + DB)
- Deployed on Vercel

---

## Project Tree (curated)
```text
spots/
  app/
    layout.tsx
    globals.css
    page.tsx                      # Home
    search/
      loading.tsx
      page.tsx
    restaurant/
      [id]/
        page.tsx                 # Restaurant detail
    reserve/
      [id]/
        page.tsx                 # Demo/step-form reserve flow
    pending/
      [id]/
        page.tsx                 # Reservation awaiting confirmation
    admin/
      login/
        page.tsx
      dashboard/
        page.tsx
    api/
      restaurants/
        [id]/route.ts            # GET /api/restaurants/[id]
        route.ts                 # GET /api/restaurants
      reservations/
        route.ts                 # POST /api/reservations
      admin/
        login/route.ts           # Admin sign-in
        reservations/route.ts    # Admin reservation ops
        restaurants/route.ts     # Admin restaurant ops
      upload/route.ts            # File uploads (Vercel Blob)

  components/
    layout/header.tsx
    home/{hero-search-bar.tsx, featured-carousel.tsx}
    reservation/{booking-dialog.tsx, reservation-form.tsx, await-confirmation-banner.tsx}
    admin/{admin-route-guard.tsx, image-upload.tsx, restaurant-manager.tsx}
    ui/                          # shadcn components
  hooks/
    use-toast.ts
  lib/
    api.ts
    supabase.ts
    database.types.ts
    types.ts
    design-tokens.ts
    mock-data.ts
    utils.ts
  public/                        # placeholders
  styles/
    globals.css                  # Legacy/global styles (primary is app/globals.css)

  tailwind.config.ts
  postcss.config.mjs
  next.config.mjs
  tsconfig.json
  components.json                # shadcn config
  design.json                    # design tokens
  designprofile.json             # design profile
  vercel.json
  package.json
  .env.local (not committed)
```

---

## Environment
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_SUPABASE_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."  # server-only
```

Supabase client: `lib/supabase.ts`
```ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
```

## Supabase — Project, Schema & RLS

### Project
- **Name**: spots
- **Region**: us-east-1
- **Postgres**: 17.4.1.054 (release_channel: ga)

Environment (live)
```env
# NEXT_PUBLIC_SUPABASE_ANON_KEY= set in local/Vercel env
# SUPABASE_SERVICE_ROLE_KEY= server-only (Vercel env)
```

### Clients
- **Public client**: `lib/supabase.ts` `supabase` using anon key.
- **Admin client**: `createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` (no session persistence).
- **Admin API auth**: `app/api/admin/**` expects `Authorization: Bearer <access_token>` and verifies via `supabaseAdmin.auth.getUser(token)`.

### Tables (live)
- `public.admin_users` (RLS enabled)
```sql
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email varchar not null unique,
  created_at timestamptz default now()
);
```

- `public.restaurants` (RLS enabled)
```sql
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  city varchar not null,
  cuisine text[] not null default '{}',
  halal boolean default false,
  price_level varchar not null,
  rating numeric default 0,
  image_url text,
  description text,
  address text,
  phone varchar,
  available_slots text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

- `public.reservations` (RLS enabled)
```sql
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id),
  customer_name varchar not null,
  customer_phone varchar not null,
  customer_email varchar,
  party_size int not null check (party_size > 0),
  reservation_date date not null,
  reservation_time time not null,
  status varchar default 'pending' check (status in ('pending','confirmed','cancelled')),
  special_requests text,
  confirmation_code varchar not null unique default upper(substr(md5(random()::text), 1, 8)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

- **Relationship**: `reservations.restaurant_id -> restaurants.id`
- **RLS**: enabled on all three tables; forced = false

### Extensions (installed)
- pg_graphql 1.5.11 (schema: graphql)
- pgcrypto 1.3
- uuid-ossp 1.1
- pg_stat_statements 1.11
- supabase_vault 0.3.1
- plpgsql 1.0

### Edge Functions
- None deployed

### Migrations
- No tracked migrations found via API (schema likely created in Studio). Consider adding SQL migrations to track DDL.

### Advisors (from Supabase)
- __Security__
  - OTP expiry > 1h. Set < 1h. https://supabase.com/docs/guides/platform/going-into-prod#security
  - Leaked password protection disabled. Enable it. https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- __Performance__
  - RLS policy functions re-evaluated per row on `reservations`, `restaurants`, `admin_users`. Replace `auth.<fn>()` with `(select auth.<fn>())`. https://supabase.com/docs/guides/database/row-level-security#call-functions-with-select
  - Multiple permissive RLS policies on `reservations` and `restaurants` for anon/authenticated/etc. Consolidate where possible. https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies
  - Unused indexes: `reservations` (confirmation_code, date, restaurant_id), `restaurants` (city).

### Types
- `lib/database.types.ts` matches live schema. Regenerate when schema changes:
```sh
supabase gen types typescript --project-id tvnodvcytjdwbhdhgbex --schema public > lib/database.types.ts
```

---

## Config Files (source of truth)

### package.json
```json
{
  "name": "spots-mvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@fontsource/inter": "^5.2.6",
    "@fontsource/poppins": "^5.2.6",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/supabase-js": "latest",
    "@vercel/blob": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.16",
    "next-themes": "latest",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8.5",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### tailwind.config.ts
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        'food-primary': '#da3743',
        'food-background': '#ffffff',
        'food-text': '#333333',
        'food-gray-light': '#f5f5f5',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
        'food-small': '4px',
        'food-medium': '8px',
        'food-large': '12px',
      },
      spacing: {
        'food-xs': '4px',
        'food-sm': '8px',
        'food-md': '16px',
        'food-lg': '24px',
        'food-xl': '32px',
        'food-2xl': '48px',
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}

export default nextConfig
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### postcss.config.mjs
```js
/** @type {import('postcss-load-config').Config} */
const config = { plugins: { tailwindcss: {} } };
export default config;
```

### vercel.json
```json
{ "buildCommand": "npm run build", "installCommand": "npm install", "framework": "nextjs" }
```

### components.json (shadcn)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

---

## API Routes (summary)
- GET `/api/restaurants` — query restaurants with filters
- GET `/api/restaurants/[id]` — fetch single restaurant
- POST `/api/reservations` — create reservation (generates confirmation code)
- POST `/api/admin/login` — admin sign-in
- Admin ops: `/api/admin/reservations`, `/api/admin/restaurants`
- POST `/api/upload` — blob upload

---

## Aliases
- TS: `@/*` → project root
- shadcn: `components`, `ui`, `lib`, `hooks` aliases per `components.json`

---

## Scripts
```sh
npm run dev    # start dev server
npm run build  # build for prod
npm run start  # start prod server
npm run lint   # lint
```

---

## Notes
- Tailwind styles are applied via `app/globals.css` (per `components.json`). `styles/globals.css` exists for legacy styles.
- Service Role key is server-only; never expose client-side.
