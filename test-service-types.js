import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (you'll need to get these from your .env file)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testServiceTypes() {
  console.log('Testing service type values across different cities...\n')
  
  // Test cities
  const testCities = [
    { city: 'Pleasanton', state: 'CA' },
    { city: 'San Francisco', state: 'CA' },
    { city: 'Los Angeles', state: 'CA' }
  ]
  
  for (const location of testCities) {
    console.log(`\n=== ${location.city}, ${location.state} ===`)
    
    // Get total count
    const { data: totalData, error: totalError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('city', location.city)
      .eq('state', location.state)
    
    if (totalError) {
      console.error('Error getting total count:', totalError)
      continue
    }
    
    console.log(`Total leads: ${totalData}`)
    
    // Get service type counts
    const { data: serviceData, error: serviceError } = await supabase
      .from('leads')
      .select('service_type')
      .eq('city', location.city)
      .eq('state', location.state)
      .not('service_type', 'is', null)
    
    if (serviceError) {
      console.error('Error getting service types:', serviceError)
      continue
    }
    
    // Count service types
    const serviceCounts = {}
    serviceData?.forEach(lead => {
      const serviceType = lead.service_type
      serviceCounts[serviceType] = (serviceCounts[serviceType] || 0) + 1
    })
    
    // Sort and display
    const sortedServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10
    
    console.log(`\nTop service types:`)
    sortedServices.forEach(([service, count]) => {
      console.log(`  ${service}: ${count}`)
    })
  }
  
  // Check for mixed service type patterns
  console.log('\n\n=== Checking for mixed service type patterns ===')
  
  const { data: allServiceTypes, error: allError } = await supabase
    .from('leads')
    .select('service_type')
    .not('service_type', 'is', null)
    .limit(1000)
  
  if (!allError && allServiceTypes) {
    const uniqueTypes = [...new Set(allServiceTypes.map(l => l.service_type))]
    
    // Categorize service types
    const uiDisplayNames = []
    const googleMapsTypes = []
    
    // Common UI display names pattern (Title Case with "Companies", "Services", etc.)
    const uiPattern = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*\s(Companies|Services|Builders|Installers|Contractors)$/
    
    uniqueTypes.forEach(type => {
      if (uiPattern.test(type)) {
        uiDisplayNames.push(type)
      } else {
        googleMapsTypes.push(type)
      }
    })
    
    console.log(`\nUI Display Names (${uiDisplayNames.length}):`)
    uiDisplayNames.slice(0, 10).forEach(name => console.log(`  - ${name}`))
    
    console.log(`\nGoogle Maps Types (${googleMapsTypes.length}):`)
    googleMapsTypes.slice(0, 10).forEach(name => console.log(`  - ${name}`))
  }
}

// Run the test
testServiceTypes().catch(console.error)