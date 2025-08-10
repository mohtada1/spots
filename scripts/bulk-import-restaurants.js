const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-') // Remove leading/trailing hyphens
}

// Helper function to convert price level
function convertPriceLevel(level) {
  const priceMap = {
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$'
  }
  return priceMap[parseInt(level)] || '$$'
}

// Helper function to assign cuisine based on restaurant name
function assignCuisine(name) {
  const nameUpper = name.toUpperCase()
  
  // Common cuisine patterns
  if (nameUpper.includes('PIZZA') || nameUpper.includes('ITALIAN')) {
    return ['Italian']
  }
  if (nameUpper.includes('CHINESE') || nameUpper.includes('CHINA')) {
    return ['Chinese']
  }
  if (nameUpper.includes('BBQ') || nameUpper.includes('GRILL') || nameUpper.includes('TIKKA')) {
    return ['Pakistani', 'BBQ']
  }
  if (nameUpper.includes('FAST') || nameUpper.includes('BURGER') || nameUpper.includes('KFC') || nameUpper.includes('MCDONALD')) {
    return ['Fast Food']
  }
  if (nameUpper.includes('CAFE') || nameUpper.includes('COFFEE')) {
    return ['Continental', 'Desserts']
  }
  if (nameUpper.includes('BIRYANI') || nameUpper.includes('KARAHI') || nameUpper.includes('DESI')) {
    return ['Pakistani']
  }
  if (nameUpper.includes('CONTINENTAL') || nameUpper.includes('WESTERN')) {
    return ['Continental']
  }
  if (nameUpper.includes('DESSERT') || nameUpper.includes('ICE') || nameUpper.includes('SWEET')) {
    return ['Desserts']
  }
  if (nameUpper.includes('ASIAN') || nameUpper.includes('THAI') || nameUpper.includes('JAPANESE')) {
    return ['Asian']
  }
  
  // Default to Pakistani for local restaurants
  return ['Pakistani']
}

// Sample data structure - replace this with your actual CSV parsing
const sampleData = [
  {
    area: 'Clifton',
    name: 'Afridi Inn Clifton',
    address: 'Block 4 Clifton, Karachi',
    rating: 4,
    totalReviews: 523,
    phoneNumber: '0345 6000039',
    website: 'http://www.afridiinn.com/',
    priceLevel: 2,
    googleMapsUrl: 'https://maps.google.com/?cid=5431049282147166598',
    openingHours: 'Monday: 6:00 PM – 1:00 AM, Tuesday: 6:00 PM – 1:00 AM, Wednesday: 6:00 PM – 1:00 AM, Thursday: 6:00 PM – 1:00 AM, Friday: 6:00 PM – 1:00 AM, Saturday: 6:00 PM – 1:00 AM, Sunday: 6:00 PM – 1:00 AM'
  }
]

async function importRestaurants(restaurantData) {
  console.log(`Starting import of ${restaurantData.length} restaurants...`)
  
  const results = {
    success: 0,
    errors: 0,
    details: []
  }

  for (const restaurant of restaurantData) {
    try {
      // Transform the data
      const transformedData = {
        name: restaurant.name.trim(),
        address: restaurant.address.trim(),
        city: 'Karachi', // All restaurants are in Karachi
        rating: parseFloat(restaurant.rating) || null,
        phone: restaurant.phoneNumber?.trim() || null,
        website: restaurant.website?.trim() || null,
        price_level: convertPriceLevel(restaurant.priceLevel),
        location: restaurant.googleMapsUrl?.trim() || null,
        opening_hours: restaurant.openingHours?.trim() || null,
        cuisine: assignCuisine(restaurant.name),
        description: null, // Will be added later via admin panel
        slug: generateSlug(restaurant.name)
      }

      // Insert into database
      const { data, error } = await supabase
        .from('restaurants')
        .insert(transformedData)
        .select()

      if (error) {
        console.error(`Error inserting ${restaurant.name}:`, error.message)
        results.errors++
        results.details.push({
          restaurant: restaurant.name,
          status: 'error',
          message: error.message
        })
      } else {
        console.log(`✓ Successfully imported: ${restaurant.name}`)
        results.success++
        results.details.push({
          restaurant: restaurant.name,
          status: 'success',
          id: data[0]?.id
        })
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err) {
      console.error(`Unexpected error with ${restaurant.name}:`, err.message)
      results.errors++
      results.details.push({
        restaurant: restaurant.name,
        status: 'error',
        message: err.message
      })
    }
  }

  return results
}

// CSV parsing function (you'll need to install csv-parser: npm install csv-parser)
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const csv = require('csv-parser')
    const results = []
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV columns to our data structure
        results.push({
          area: data.Area,
          name: data.Name,
          address: data.Address,
          rating: parseFloat(data.Rating),
          totalReviews: parseInt(data['Total Reviews']),
          phoneNumber: data['Phone Number'],
          website: data.Website,
          priceLevel: parseInt(data['Price Level']),
          googleMapsUrl: data['Google Maps URL'],
          openingHours: data['Opening Hours']
        })
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting bulk restaurant import...')
    
    // Option 1: Use sample data (for testing)
    // const restaurantData = sampleData
    
    // Option 2: Parse CSV file (uncomment and provide file path)
    const csvFilePath = path.join(__dirname, 'restaurants.csv')
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`)
      console.log('Please place your CSV file at:', csvFilePath)
      console.log('Or update the csvFilePath variable in the script')
      process.exit(1)
    }
    
    const restaurantData = await parseCSV(csvFilePath)
    console.log(`📊 Parsed ${restaurantData.length} restaurants from CSV`)
    
    // Import the data
    const results = await importRestaurants(restaurantData)
    
    // Summary
    console.log('\n📈 Import Summary:')
    console.log(`✅ Successful imports: ${results.success}`)
    console.log(`❌ Failed imports: ${results.errors}`)
    console.log(`📊 Total processed: ${results.success + results.errors}`)
    
    if (results.errors > 0) {
      console.log('\n❌ Failed imports:')
      results.details
        .filter(d => d.status === 'error')
        .forEach(d => console.log(`  - ${d.restaurant}: ${d.message}`))
    }
    
    console.log('\n🎉 Import completed!')
    
  } catch (error) {
    console.error('💥 Import failed:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { importRestaurants, parseCSV, assignCuisine, generateSlug }
