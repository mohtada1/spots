-- Create categories table for homepage tabs
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for restaurant-category relationships
CREATE TABLE IF NOT EXISTS restaurant_categories (
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (restaurant_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurant_categories_restaurant_id ON restaurant_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_categories_category_id ON restaurant_categories(category_id);

-- Insert initial categories based on the new requirements
INSERT INTO categories (title, description, display_order) VALUES
('Featured Restaurants', 'Curated by you', 1),
('Newly Added', 'Dynamic and shows growth', 2),
('Best of Desi Cuisine', 'Answers a primary user question', 3),
('Great for Groups & Buffets', 'Solves a specific, local need', 4),
('Rooftop Dining', 'Sells an experience and vibe', 5);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to restaurant_categories" ON restaurant_categories
  FOR SELECT USING (true);

-- Create policies for admin access (assuming admin role exists)
CREATE POLICY "Allow admin full access to categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to restaurant_categories" ON restaurant_categories
  FOR ALL USING (auth.role() = 'authenticated');
