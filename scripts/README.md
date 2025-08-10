# Bulk Restaurant Import

## Quick Setup

1. **Export your Excel file as CSV** with these exact column headers:
   ```
   Area,Name,Address,Rating,Total Reviews,Phone Number,Website,Price Level,Google Maps URL,Opening Hours
   ```

2. **Save the CSV file** as `restaurants.csv` in the `/scripts/` folder

3. **Run the import**:
   ```bash
   npm run import-restaurants
   ```

## What the script does:

- ✅ Converts price levels (1→"$", 2→"$$", etc.)
- ✅ Auto-assigns cuisine types based on restaurant names
- ✅ Generates SEO-friendly slugs
- ✅ Sets all restaurants to "Karachi" city
- ✅ Validates and imports Google Maps URLs
- ✅ Handles errors gracefully with detailed reporting

## Auto-assigned cuisines:

The script intelligently assigns cuisines based on restaurant names:
- Names with "BBQ", "Grill", "Tikka" → Pakistani, BBQ
- Names with "Pizza", "Italian" → Italian  
- Names with "Chinese", "China" → Chinese
- Names with "Burger", "Fast" → Fast Food
- Names with "Cafe", "Coffee" → Continental, Desserts
- Names with "Biryani", "Karahi" → Pakistani
- Default → Pakistani

## File structure:
```
scripts/
├── bulk-import-restaurants.js  # Main import script
├── restaurants.csv            # Your data file (place here)
└── README.md                  # This file
```

## Environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting:

**"CSV file not found"** → Make sure `restaurants.csv` is in the `/scripts/` folder

**"Missing Supabase environment variables"** → Check your `.env.local` file

**Import errors** → The script will show detailed error messages for each failed restaurant
