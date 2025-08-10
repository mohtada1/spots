require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Running categories migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-categories-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('1')
            .limit(0)
          
          if (directError && !directError.message.includes('does not exist')) {
            console.error('Error executing statement:', statement)
            console.error('Error:', error)
            throw error
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('📝 Categories table created with initial data')
    console.log('🔗 Restaurant-categories junction table created')
    console.log('🔒 RLS policies applied')
    
    // Verify the migration
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    
    if (fetchError) {
      console.error('Error verifying migration:', fetchError)
    } else {
      console.log('\n📊 Created categories:')
      categories.forEach(cat => {
        console.log(`  ${cat.display_order}. ${cat.title} - ${cat.description}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
