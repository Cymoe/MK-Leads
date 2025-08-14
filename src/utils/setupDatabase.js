import { supabase } from '../lib/supabase'

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('markets').select('count').limit(1)
    
    if (error && error.code === '42P01') {
      console.log('❌ Tables not found. Please run the SQL schema in your Supabase dashboard.')
      console.log('\n📋 Instructions:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of supabase/schema.sql')
      console.log('4. Run the SQL to create all tables')
      return false
    } else if (error) {
      console.error('❌ Connection error:', error.message)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    return true
  } catch (err) {
    console.error('❌ Failed to connect:', err)
    return false
  }
}

async function checkTables() {
  const tables = ['markets', 'leads', 'import_history', 'market_phases']
  const results = {}
  
  console.log('\n📊 Checking tables...')
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        results[table] = { exists: false, error: error.message }
        console.log(`  ❌ ${table}: Not found`)
      } else {
        results[table] = { exists: true, count }
        console.log(`  ✅ ${table}: Found (${count || 0} records)`)
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message }
      console.log(`  ❌ ${table}: Error - ${err.message}`)
    }
  }
  
  return results
}

async function insertSampleData() {
  try {
    console.log('\n📝 Inserting sample data...')
    
    // Insert sample markets
    const markets = [
      {
        name: 'Fort Collins',
        state: 'CO',
        type: 'SMALL',
        region: 'Mountain',
        service_types: ['Painting', 'Deck Building', 'Turf Installation'],
        coverage_percentage: 75
      },
      {
        name: 'Boulder',
        state: 'CO',
        type: 'SMALL',
        region: 'Mountain',
        service_types: ['Painting', 'Landscaping'],
        coverage_percentage: 60
      },
      {
        name: 'Phoenix',
        state: 'AZ',
        type: 'MEGA',
        region: 'Southwest',
        service_types: ['Painting', 'Pool Service', 'HVAC'],
        coverage_percentage: 45
      }
    ]
    
    const { data: marketData, error: marketError } = await supabase
      .from('markets')
      .upsert(markets, { onConflict: 'name,state' })
      .select()
    
    if (marketError) {
      console.log('  ⚠️  Markets: Error inserting -', marketError.message)
    } else {
      console.log(`  ✅ Markets: Inserted ${marketData.length} sample markets`)
    }
    
    // Insert sample leads for Fort Collins
    if (marketData && marketData.length > 0) {
      const fortCollinsMarket = marketData.find(m => m.name === 'Fort Collins')
      
      if (fortCollinsMarket) {
        const sampleLeads = [
          {
            market_id: fortCollinsMarket.id,
            name: 'ABC Painting Co',
            address: '123 Main St, Fort Collins, CO 80521',
            city: 'Fort Collins',
            state: 'CO',
            zip: '80521',
            phone: '(970) 555-0123',
            website: 'https://abcpainting.example.com',
            category: 'Painting Contractors',
            rating: 4.5,
            reviews: 127,
            source: 'apify',
            verified: true
          },
          {
            market_id: fortCollinsMarket.id,
            name: 'Mountain Deck Builders',
            address: '456 Oak Ave, Fort Collins, CO 80524',
            city: 'Fort Collins',
            state: 'CO',
            zip: '80524',
            phone: '(970) 555-0456',
            category: 'Deck Builders',
            rating: 4.8,
            reviews: 89,
            source: 'apify',
            verified: true
          },
          {
            market_id: fortCollinsMarket.id,
            name: 'Green Turf Pros',
            address: '789 Pine Rd, Fort Collins, CO 80525',
            city: 'Fort Collins',
            state: 'CO',
            zip: '80525',
            phone: '(970) 555-0789',
            category: 'Turf Installation',
            rating: 4.2,
            reviews: 45,
            source: 'apify',
            verified: false
          }
        ]
        
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .upsert(sampleLeads, { onConflict: 'name,address' })
          .select()
        
        if (leadError) {
          console.log('  ⚠️  Leads: Error inserting -', leadError.message)
        } else {
          console.log(`  ✅ Leads: Inserted ${leadData.length} sample leads`)
        }
        
        // Insert market phases
        const phases = [
          {
            market_id: fortCollinsMarket.id,
            phase: 1,
            phase_name: 'Google Maps',
            status: 'active',
            leads_count: 253,
            searches_performed: 11,
            matched_count: 0,
            unmatched_count: 253
          },
          {
            market_id: fortCollinsMarket.id,
            phase: 2,
            phase_name: 'Facebook Ads',
            status: 'inactive',
            leads_count: 0,
            searches_performed: 0
          },
          {
            market_id: fortCollinsMarket.id,
            phase: 3,
            phase_name: 'Instagram',
            status: 'inactive',
            leads_count: 0,
            searches_performed: 0
          }
        ]
        
        const { data: phaseData, error: phaseError } = await supabase
          .from('market_phases')
          .upsert(phases, { onConflict: 'market_id,phase' })
          .select()
        
        if (phaseError) {
          console.log('  ⚠️  Phases: Error inserting -', phaseError.message)
        } else {
          console.log(`  ✅ Phases: Inserted ${phaseData.length} phase records`)
        }
      }
    }
    
    return true
  } catch (err) {
    console.error('❌ Error inserting sample data:', err)
    return false
  }
}

export async function setupDatabase() {
  console.log('🚀 Supabase Database Setup\n')
  console.log('================================\n')
  
  // Test connection
  const connected = await testConnection()
  if (!connected) {
    return
  }
  
  // Check tables
  const tables = await checkTables()
  const allTablesExist = Object.values(tables).every(t => t.exists)
  
  if (!allTablesExist) {
    console.log('\n⚠️  Some tables are missing!')
    console.log('Please run the SQL schema from supabase/schema.sql in your Supabase SQL Editor')
    return
  }
  
  // Ask if user wants sample data
  console.log('\n✨ All tables are ready!')
  
  // Insert sample data (you can comment this out if not needed)
  const shouldInsertSample = true // Set to false if you don't want sample data
  if (shouldInsertSample) {
    await insertSampleData()
  }
  
  console.log('\n✅ Database setup complete!')
  console.log('You can now use the application with your Supabase backend.')
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
}
