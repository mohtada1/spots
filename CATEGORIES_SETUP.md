# Dynamic Categories Setup Guide

This guide will help you set up the new dynamic homepage categories system with admin panel control.

## 🎯 What's New

- **Dynamic Homepage Tabs**: Replace hardcoded tabs with admin-controlled categories
- **Admin Category Management**: Full CRUD operations for categories
- **Restaurant-Category Assignments**: Many-to-many relationships
- **Clean UI**: Removed "Featured" badges from restaurant cards

## 📋 Setup Steps

### 1. Run Database Migration

```bash
# Install dependencies if not already done
npm install

# Run the categories migration
node scripts/run-categories-migration.js
```

This creates:
- `categories` table with initial 5 categories
- `restaurant_categories` junction table
- Proper indexes and RLS policies

### 2. Verify Migration

Check your Supabase dashboard to confirm:
- ✅ `categories` table exists with 5 initial categories
- ✅ `restaurant_categories` table exists (empty initially)
- ✅ RLS policies are active

### 3. Access Admin Panel

1. Go to `/admin/dashboard`
2. Click the new **"Categories"** tab
3. You'll see the 5 initial categories:
   - Featured Restaurants
   - Newly Added
   - Best of Desi Cuisine
   - Great for Groups & Buffets
   - Rooftop Dining

### 4. Assign Restaurants to Categories

In the admin panel:
1. Edit each category as needed
2. Use the restaurant assignment feature (coming in next update)
3. Categories will appear on homepage automatically

## 🏠 Homepage Changes

### Before
- Hardcoded tabs: Featured, Nearby & Available, Top Rated, Book Now
- "Featured" badges on restaurant cards
- Static restaurant filtering

### After
- Dynamic tabs from database
- Clean restaurant cards without badges
- Admin-controlled content
- Flexible category system

## 🔧 API Endpoints

### Categories
- `GET /api/categories` - List active categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Restaurant Assignments
- `GET /api/categories/[id]/restaurants` - Get restaurants in category
- `POST /api/categories/[id]/restaurants` - Assign restaurants to category

## 📝 Admin Features

### Category Management
- ✅ Create/Edit/Delete categories
- ✅ Set display order
- ✅ Toggle active/inactive
- ✅ Edit titles and descriptions

### Restaurant Assignment (Next Phase)
- 🔄 Bulk assign restaurants to categories
- 🔄 Multi-category assignments
- 🔄 Drag-and-drop interface

## 🎨 Customization

### Adding New Categories
1. Go to admin panel → Categories tab
2. Click "Add Category"
3. Fill in title, description, display order
4. Save - appears on homepage immediately

### Category Descriptions
These appear as subtitles on the homepage:
- "Featured Restaurants" → "Curated by you"
- "Newly Added" → "Dynamic and shows growth"
- etc.

## 🐛 Troubleshooting

### Migration Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Re-run migration
node scripts/run-categories-migration.js
```

### Homepage Not Loading Categories
1. Check browser console for API errors
2. Verify categories exist in database
3. Check RLS policies are correct

### Admin Panel Access
1. Ensure you're logged in as admin
2. Check admin authentication
3. Verify API endpoints are working

## 🚀 Next Steps

1. **Run the migration** to set up database tables
2. **Test the homepage** - should show new dynamic categories
3. **Access admin panel** - manage categories in the new tab
4. **Assign restaurants** to categories (manual for now)
5. **Customize categories** to match your brand

The system is now fully dynamic and admin-controlled! 🎉
